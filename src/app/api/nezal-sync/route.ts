import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  let browser;
  
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    console.log('🚀 Starting Nazeel scraper...');

    // تشغيل المتصفح
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('📱 Navigating to Nazeel...');
    await page.goto('https://pms.nazeel.net/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    console.log('✅ Page loaded, waiting 3 seconds...');
    
    // الانتظار قليلاً للتأكد من تحميل الصفحة
    await page.waitForTimeout(3000);

    // تسجيل الدخول - البحث عن حقول الإدخال
    console.log('🔐 Looking for login form...');
    
    // أولاً: طباعة كل الـInputs الموجودة
    const allInputs = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      return inputs.map(input => ({
        type: input.type,
        name: input.name || 'NO_NAME',
        id: input.id || 'NO_ID',
        placeholder: input.placeholder || 'NO_PLACEHOLDER',
        className: input.className || 'NO_CLASS'
      }));
    });
    
    console.log('📝 Found', allInputs.length, 'inputs on page:');
    console.log(JSON.stringify(allInputs, null, 2));
    
    // محاولة إيجاد حقل الإيميل/اسم المستخدم
    const emailSelector = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const emailInput = inputs.find(input => 
        input.type === 'email' || 
        input.type === 'text' ||
        input.name?.toLowerCase().includes('email') ||
        input.name?.toLowerCase().includes('username') ||
        input.name?.toLowerCase().includes('user') ||
        input.placeholder?.toLowerCase().includes('email') ||
        input.placeholder?.toLowerCase().includes('بريد') ||
        input.placeholder?.toLowerCase().includes('مستخدم')
      );
      
      if (emailInput) {
        // إضافة ID مؤقت للعنصر
        emailInput.id = 'temp-email-input';
        return '#temp-email-input';
      }
      return null;
    });

    console.log('🔍 Email selector result:', emailSelector);

    if (!emailSelector) {
      // أخذ screenshot للمساعدة في التشخيص
      const screenshotPath = `./nazeel-error-${Date.now()}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log('📸 Screenshot saved to:', screenshotPath);
      
      throw new Error('لم يتم العثور على حقل الإيميل - تم حفظ screenshot');
    }

    const passwordSelector = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const passwordInput = inputs.find(input => 
        input.type === 'password' ||
        input.name?.toLowerCase().includes('password') ||
        input.name?.toLowerCase().includes('pass') ||
        input.placeholder?.toLowerCase().includes('password') ||
        input.placeholder?.toLowerCase().includes('مرور') ||
        input.placeholder?.toLowerCase().includes('كلمة')
      );
      
      if (passwordInput) {
        passwordInput.id = 'temp-password-input';
        return '#temp-password-input';
      }
      return null;
    });

    if (!passwordSelector) {
      throw new Error('لم يتم العثور على حقل كلمة المرور');
    }

    console.log('✅ Found login form, filling credentials...');
    
    await page.type(emailSelector, email);
    await page.type(passwordSelector, password);
    
    // الضغط على زر تسجيل الدخول
    await Promise.all([
      page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], a.btn'));
        const loginButton = buttons.find(btn => 
          btn.textContent?.includes('دخول') ||
          btn.textContent?.includes('تسجيل') ||
          btn.textContent?.includes('Login') ||
          btn.textContent?.includes('Sign')
        ) as HTMLElement;
        
        if (loginButton) {
          loginButton.click();
        }
      }),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {})
    ]);

    console.log('✅ Login successful');

    // الانتظار قليلاً بعد تسجيل الدخول
    await page.waitForTimeout(2000);

    // البحث عن صفحة الشقق/الغرف
    console.log('🏠 Looking for rooms page...');
    
    // محاولة إيجاد رابط صفحة الغرف
    const roomsPageFound = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const roomLink = links.find(link => 
        link.textContent?.includes('الغرف') || 
        link.textContent?.includes('الشقق') ||
        link.textContent?.includes('التسكين') ||
        link.href.includes('room') ||
        link.href.includes('accommodation')
      );
      
      if (roomLink) {
        roomLink.click();
        return true;
      }
      return false;
    });

    if (roomsPageFound) {
      await page.waitForTimeout(3000);
      console.log('📄 Rooms page loaded');
    }

    // استخراج بيانات الغرف المشغولة
    console.log('📊 Extracting bookings data...');
    
    const bookings = await page.evaluate(() => {
      const data: any[] = [];
      
      // البحث عن جداول أو بطاقات الغرف
      const tables = document.querySelectorAll('table');
      const cards = document.querySelectorAll('.card, .room-card, [class*="room"]');
      
      // محاولة استخراج من الجداول
      tables.forEach(table => {
        const rows = table.querySelectorAll('tr');
        rows.forEach((row, index) => {
          if (index === 0) return; // تخطي العنوان
          
          const cells = row.querySelectorAll('td');
          if (cells.length >= 3) {
            const roomNumber = cells[0]?.textContent?.trim();
            const guestName = cells[1]?.textContent?.trim();
            const status = cells[2]?.textContent?.trim();
            
            if (roomNumber && guestName && status?.includes('مشغول')) {
              data.push({
                roomNumber,
                guestName,
                status: 'occupied'
              });
            }
          }
        });
      });

      // محاولة استخراج من البطاقات
      cards.forEach(card => {
        const roomNumber = card.querySelector('[class*="room-number"], [class*="number"]')?.textContent?.trim();
        const guestName = card.querySelector('[class*="guest"], [class*="name"]')?.textContent?.trim();
        const status = card.querySelector('[class*="status"]')?.textContent?.trim();
        
        if (roomNumber && guestName) {
          data.push({
            roomNumber,
            guestName,
            status: status || 'occupied'
          });
        }
      });

      return data;
    });

    console.log(`✅ Found ${bookings.length} bookings`);

    // إغلاق المتصفح
    await browser.close();

    return NextResponse.json({
      success: true,
      bookings,
      count: bookings.length
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    
    if (browser) {
      await browser.close();
    }

    return NextResponse.json(
      { 
        error: 'فشل في الاتصال بـ Nazeel',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
