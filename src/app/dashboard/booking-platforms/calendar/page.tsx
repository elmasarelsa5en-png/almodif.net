'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Building2, Users, Save, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <h1 className="text-white text-3xl flex items-center gap-3">
              <CalendarIcon className="w-8 h-8" />
              تقويم الأسعار
            </h1>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
