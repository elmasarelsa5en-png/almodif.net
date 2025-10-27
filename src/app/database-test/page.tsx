'use client';

import { useState, useEffect } from 'react';
import { testDatabaseConnection } from '../../lib/database-test';
import { useLanguage } from '../../contexts/language-context';
import { translations } from '../../lib/translations';

export default function DatabaseTestPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];

  const runTest = async () => {
    setIsLoading(true);
    setTestResult('');

    try {
      const success = await testDatabaseConnection();
      if (success) {
        setTestResult(language === 'ar' ? 'تم الاتصال بقاعدة البيانات بنجاح!' : 'Database connection successful!');
      } else {
        setTestResult(language === 'ar' ? 'فشل في الاتصال بقاعدة البيانات' : 'Database connection failed');
      }
    } catch (error) {
      setTestResult(language === 'ar' ? `خطأ: ${error}` : `Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          {language === 'ar' ? 'اختبار قاعدة البيانات' : 'Database Test'}
        </h1>

        <button
          onClick={runTest}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading
            ? (language === 'ar' ? 'جاري الاختبار...' : 'Testing...')
            : (language === 'ar' ? 'اختبر الاتصال' : 'Test Connection')
          }
        </button>

        {testResult && (
          <div className={`mt-4 p-4 rounded-md ${
            testResult.includes('نجاح') || testResult.includes('successful')
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {testResult}
          </div>
        )}
      </div>
    </div>
  );
}