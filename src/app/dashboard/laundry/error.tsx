"use client";
import React from "react";

export default function Error({ error }: { error: Error }) {
  return (
    <div style={{ padding: 32, textAlign: "center" }}>
      <h2>حدث خطأ غير متوقع في صفحة المغسلة</h2>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>إعادة تحميل الصفحة</button>
    </div>
  );
}
