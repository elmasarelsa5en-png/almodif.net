/**
 * Firebase Cloud Functions for Push Notifications
 * 
 * This function automatically sends push notifications to employees
 * when a new request is assigned to them.
 */

import {setGlobalOptions} from "firebase-functions";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

// Initialize Firebase Admin
admin.initializeApp();

// Set global options
setGlobalOptions({ maxInstances: 10 });

/**
 * Cloud Function: Send notification when a new request is created
 * Triggers automatically when a document is added to 'requests' collection
 */
export const sendRequestNotification = onDocumentCreated(
  "requests/{requestId}",
  async (event) => {
    try {
      const requestData = event.data?.data();
      const requestId = event.params.requestId;

      if (!requestData) {
        logger.warn(`No data found for request ${requestId}`);
        return;
      }

      logger.info(`🔔 New request created: ${requestId}`, { requestData });

      // Get assigned employee ID
      const assignedEmployeeId = requestData.assignedEmployeeId;
      
      if (!assignedEmployeeId) {
        logger.warn(`No employee assigned to request ${requestId}`);
        return;
      }

      // Fetch employee data to get FCM token
      const employeeRef = admin.firestore().collection("employees").doc(assignedEmployeeId);
      const employeeDoc = await employeeRef.get();

      if (!employeeDoc.exists) {
        logger.error(`Employee ${assignedEmployeeId} not found`);
        return;
      }

      const employeeData = employeeDoc.data();
      const fcmToken = employeeData?.fcmToken;

      if (!fcmToken) {
        logger.warn(`No FCM token found for employee ${assignedEmployeeId}`);
        return;
      }

      // Prepare notification message
      const message: admin.messaging.Message = {
        token: fcmToken,
        notification: {
          title: "📋 طلب جديد",
          body: `لديك طلب جديد من غرفة ${requestData.room} - ${requestData.guest}`,
        },
        data: {
          type: "new_request",
          requestId: requestId,
          roomNumber: requestData.room || "",
          priority: requestData.priority || "normal",
          url: "/dashboard/employee-requests",
          playSound: "true"
        },
        android: {
          priority: "high",
          notification: {
            sound: "default",
            priority: "high",
            channelId: "requests",
            visibility: "public"
          }
        },
        apns: {
          headers: {
            "apns-priority": "10"
          },
          payload: {
            aps: {
              sound: "default",
              badge: 1,
              alert: {
                title: "📋 طلب جديد",
                body: `لديك طلب جديد من غرفة ${requestData.room} - ${requestData.guest}`
              }
            }
          }
        },
        webpush: {
          headers: {
            Urgency: "high"
          },
          notification: {
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            requireInteraction: true,
            vibrate: [200, 100, 200, 100, 200, 100, 200],
            tag: `request-${requestId}`,
            actions: [
              {
                action: "accept",
                title: "✅ قبول الطلب"
              },
              {
                action: "open",
                title: "👁️ عرض التفاصيل"
              }
            ]
          }
        }
      };

      // Send the notification
      const response = await admin.messaging().send(message);
      
      logger.info(`✅ Notification sent successfully to ${employeeData.name}`, {
        messageId: response,
        employeeId: assignedEmployeeId,
        requestId: requestId
      });

      // Update employee document with last notification time
      await employeeRef.update({
        lastNotificationSentAt: admin.firestore.FieldValue.serverTimestamp(),
        totalNotificationsSent: admin.firestore.FieldValue.increment(1)
      });

      return { success: true, messageId: response };
    } catch (error) {
      logger.error("❌ Error sending notification:", error);
      return { success: false, error: String(error) };
    }
  }
);

/**
 * Cloud Function: Clean up old notifications
 * Can be scheduled to run daily using Cloud Scheduler
 */
export const cleanupOldNotifications = onDocumentCreated(
  "maintenance/{docId}",
  async (event) => {
    try {
      logger.info("🧹 Starting cleanup of old notifications");

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const oldNotificationsQuery = admin
        .firestore()
        .collection("employeeNotifications")
        .where("createdAt", "<", sevenDaysAgo.toISOString())
        .where("read", "==", true);

      const snapshot = await oldNotificationsQuery.get();
      
      if (snapshot.empty) {
        logger.info("No old notifications to delete");
        return { deleted: 0 };
      }

      const batch = admin.firestore().batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      
      logger.info(`✅ Deleted ${snapshot.size} old notifications`);
      return { deleted: snapshot.size };
    } catch (error) {
      logger.error("❌ Error cleaning up notifications:", error);
      return { success: false, error: String(error) };
    }
  }
);
