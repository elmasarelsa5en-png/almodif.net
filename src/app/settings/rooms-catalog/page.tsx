'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// تم حذف صفحة كتالوج الغرف بناءً على طلب المستخدم
export default function RoomsCatalogPage() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>كتالوج الغرف</CardTitle>
          <CardDescription>هذه الصفحة تم تعطيلها مؤقتاً</CardDescription>
        </CardHeader>
        <CardContent>
          <p>تم تعطيل هذه الصفحة بناءً على طلب المستخدم.</p>
        </CardContent>
      </Card>
    </div>
  );
}