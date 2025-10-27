'use client';
import { Card } from '@/components/ui/card';
export default function RoomsCatalogPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">كتالوج الشقق</h1>
      <Card className="p-6">
        <p className="text-muted-foreground">قاعدة بيانات الغرف للذكاء الاصطناعي</p>
      </Card>
    </div>
  );
}
