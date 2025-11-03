/**
 * قائمة دول العالم كاملة
 * مرتبة أبجدياً بالعربية مع الترجمة الإنجليزية
 */

export interface Country {
  nameAr: string;
  nameEn: string;
  code: string; // ISO 3166-1 alpha-2
}

export const COUNTRIES: Country[] = [
  // الدول العربية أولاً
  { nameAr: 'السعودية', nameEn: 'Saudi Arabia', code: 'SA' },
  { nameAr: 'الإمارات', nameEn: 'United Arab Emirates', code: 'AE' },
  { nameAr: 'مصر', nameEn: 'Egypt', code: 'EG' },
  { nameAr: 'الأردن', nameEn: 'Jordan', code: 'JO' },
  { nameAr: 'الكويت', nameEn: 'Kuwait', code: 'KW' },
  { nameAr: 'البحرين', nameEn: 'Bahrain', code: 'BH' },
  { nameAr: 'عمان', nameEn: 'Oman', code: 'OM' },
  { nameAr: 'قطر', nameEn: 'Qatar', code: 'QA' },
  { nameAr: 'لبنان', nameEn: 'Lebanon', code: 'LB' },
  { nameAr: 'سوريا', nameEn: 'Syria', code: 'SY' },
  { nameAr: 'العراق', nameEn: 'Iraq', code: 'IQ' },
  { nameAr: 'فلسطين', nameEn: 'Palestine', code: 'PS' },
  { nameAr: 'اليمن', nameEn: 'Yemen', code: 'YE' },
  { nameAr: 'ليبيا', nameEn: 'Libya', code: 'LY' },
  { nameAr: 'تونس', nameEn: 'Tunisia', code: 'TN' },
  { nameAr: 'الجزائر', nameEn: 'Algeria', code: 'DZ' },
  { nameAr: 'المغرب', nameEn: 'Morocco', code: 'MA' },
  { nameAr: 'موريتانيا', nameEn: 'Mauritania', code: 'MR' },
  { nameAr: 'السودان', nameEn: 'Sudan', code: 'SD' },
  { nameAr: 'الصومال', nameEn: 'Somalia', code: 'SO' },
  { nameAr: 'جيبوتي', nameEn: 'Djibouti', code: 'DJ' },
  { nameAr: 'جزر القمر', nameEn: 'Comoros', code: 'KM' },
  
  // باقي دول العالم
  { nameAr: 'أفغانستان', nameEn: 'Afghanistan', code: 'AF' },
  { nameAr: 'ألبانيا', nameEn: 'Albania', code: 'AL' },
  { nameAr: 'ألمانيا', nameEn: 'Germany', code: 'DE' },
  { nameAr: 'أندورا', nameEn: 'Andorra', code: 'AD' },
  { nameAr: 'أنغولا', nameEn: 'Angola', code: 'AO' },
  { nameAr: 'أنتيغوا وبربودا', nameEn: 'Antigua and Barbuda', code: 'AG' },
  { nameAr: 'الأرجنتين', nameEn: 'Argentina', code: 'AR' },
  { nameAr: 'أرمينيا', nameEn: 'Armenia', code: 'AM' },
  { nameAr: 'أستراليا', nameEn: 'Australia', code: 'AU' },
  { nameAr: 'النمسا', nameEn: 'Austria', code: 'AT' },
  { nameAr: 'أذربيجان', nameEn: 'Azerbaijan', code: 'AZ' },
  { nameAr: 'الباهاماس', nameEn: 'Bahamas', code: 'BS' },
  { nameAr: 'بنغلاديش', nameEn: 'Bangladesh', code: 'BD' },
  { nameAr: 'باربادوس', nameEn: 'Barbados', code: 'BB' },
  { nameAr: 'بيلاروسيا', nameEn: 'Belarus', code: 'BY' },
  { nameAr: 'بلجيكا', nameEn: 'Belgium', code: 'BE' },
  { nameAr: 'بليز', nameEn: 'Belize', code: 'BZ' },
  { nameAr: 'بنين', nameEn: 'Benin', code: 'BJ' },
  { nameAr: 'بوتان', nameEn: 'Bhutan', code: 'BT' },
  { nameAr: 'بوليفيا', nameEn: 'Bolivia', code: 'BO' },
  { nameAr: 'البوسنة والهرسك', nameEn: 'Bosnia and Herzegovina', code: 'BA' },
  { nameAr: 'بوتسوانا', nameEn: 'Botswana', code: 'BW' },
  { nameAr: 'البرازيل', nameEn: 'Brazil', code: 'BR' },
  { nameAr: 'بروناي', nameEn: 'Brunei', code: 'BN' },
  { nameAr: 'بلغاريا', nameEn: 'Bulgaria', code: 'BG' },
  { nameAr: 'بوركينا فاسو', nameEn: 'Burkina Faso', code: 'BF' },
  { nameAr: 'بوروندي', nameEn: 'Burundi', code: 'BI' },
  { nameAr: 'كمبوديا', nameEn: 'Cambodia', code: 'KH' },
  { nameAr: 'الكاميرون', nameEn: 'Cameroon', code: 'CM' },
  { nameAr: 'كندا', nameEn: 'Canada', code: 'CA' },
  { nameAr: 'الرأس الأخضر', nameEn: 'Cape Verde', code: 'CV' },
  { nameAr: 'جمهورية أفريقيا الوسطى', nameEn: 'Central African Republic', code: 'CF' },
  { nameAr: 'تشاد', nameEn: 'Chad', code: 'TD' },
  { nameAr: 'تشيلي', nameEn: 'Chile', code: 'CL' },
  { nameAr: 'الصين', nameEn: 'China', code: 'CN' },
  { nameAr: 'كولومبيا', nameEn: 'Colombia', code: 'CO' },
  { nameAr: 'الكونغو', nameEn: 'Congo', code: 'CG' },
  { nameAr: 'جمهورية الكونغو الديمقراطية', nameEn: 'Congo (DRC)', code: 'CD' },
  { nameAr: 'كوستاريكا', nameEn: 'Costa Rica', code: 'CR' },
  { nameAr: 'ساحل العاج', nameEn: 'Côte d\'Ivoire', code: 'CI' },
  { nameAr: 'كرواتيا', nameEn: 'Croatia', code: 'HR' },
  { nameAr: 'كوبا', nameEn: 'Cuba', code: 'CU' },
  { nameAr: 'قبرص', nameEn: 'Cyprus', code: 'CY' },
  { nameAr: 'التشيك', nameEn: 'Czech Republic', code: 'CZ' },
  { nameAr: 'الدنمارك', nameEn: 'Denmark', code: 'DK' },
  { nameAr: 'دومينيكا', nameEn: 'Dominica', code: 'DM' },
  { nameAr: 'جمهورية الدومينيكان', nameEn: 'Dominican Republic', code: 'DO' },
  { nameAr: 'تيمور الشرقية', nameEn: 'East Timor', code: 'TL' },
  { nameAr: 'الإكوادور', nameEn: 'Ecuador', code: 'EC' },
  { nameAr: 'السلفادور', nameEn: 'El Salvador', code: 'SV' },
  { nameAr: 'غينيا الاستوائية', nameEn: 'Equatorial Guinea', code: 'GQ' },
  { nameAr: 'إريتريا', nameEn: 'Eritrea', code: 'ER' },
  { nameAr: 'إستونيا', nameEn: 'Estonia', code: 'EE' },
  { nameAr: 'إثيوبيا', nameEn: 'Ethiopia', code: 'ET' },
  { nameAr: 'فيجي', nameEn: 'Fiji', code: 'FJ' },
  { nameAr: 'فنلندا', nameEn: 'Finland', code: 'FI' },
  { nameAr: 'فرنسا', nameEn: 'France', code: 'FR' },
  { nameAr: 'الغابون', nameEn: 'Gabon', code: 'GA' },
  { nameAr: 'غامبيا', nameEn: 'Gambia', code: 'GM' },
  { nameAr: 'جورجيا', nameEn: 'Georgia', code: 'GE' },
  { nameAr: 'غانا', nameEn: 'Ghana', code: 'GH' },
  { nameAr: 'اليونان', nameEn: 'Greece', code: 'GR' },
  { nameAr: 'غرينادا', nameEn: 'Grenada', code: 'GD' },
  { nameAr: 'غواتيمالا', nameEn: 'Guatemala', code: 'GT' },
  { nameAr: 'غينيا', nameEn: 'Guinea', code: 'GN' },
  { nameAr: 'غينيا بيساو', nameEn: 'Guinea-Bissau', code: 'GW' },
  { nameAr: 'غيانا', nameEn: 'Guyana', code: 'GY' },
  { nameAr: 'هايتي', nameEn: 'Haiti', code: 'HT' },
  { nameAr: 'هندوراس', nameEn: 'Honduras', code: 'HN' },
  { nameAr: 'المجر', nameEn: 'Hungary', code: 'HU' },
  { nameAr: 'آيسلندا', nameEn: 'Iceland', code: 'IS' },
  { nameAr: 'الهند', nameEn: 'India', code: 'IN' },
  { nameAr: 'إندونيسيا', nameEn: 'Indonesia', code: 'ID' },
  { nameAr: 'إيران', nameEn: 'Iran', code: 'IR' },
  { nameAr: 'أيرلندا', nameEn: 'Ireland', code: 'IE' },
  { nameAr: 'إسرائيل', nameEn: 'Israel', code: 'IL' },
  { nameAr: 'إيطاليا', nameEn: 'Italy', code: 'IT' },
  { nameAr: 'جامايكا', nameEn: 'Jamaica', code: 'JM' },
  { nameAr: 'اليابان', nameEn: 'Japan', code: 'JP' },
  { nameAr: 'كازاخستان', nameEn: 'Kazakhstan', code: 'KZ' },
  { nameAr: 'كينيا', nameEn: 'Kenya', code: 'KE' },
  { nameAr: 'كيريباتي', nameEn: 'Kiribati', code: 'KI' },
  { nameAr: 'كوريا الشمالية', nameEn: 'North Korea', code: 'KP' },
  { nameAr: 'كوريا الجنوبية', nameEn: 'South Korea', code: 'KR' },
  { nameAr: 'كوسوفو', nameEn: 'Kosovo', code: 'XK' },
  { nameAr: 'قيرغيزستان', nameEn: 'Kyrgyzstan', code: 'KG' },
  { nameAr: 'لاوس', nameEn: 'Laos', code: 'LA' },
  { nameAr: 'لاتفيا', nameEn: 'Latvia', code: 'LV' },
  { nameAr: 'ليسوتو', nameEn: 'Lesotho', code: 'LS' },
  { nameAr: 'ليبيريا', nameEn: 'Liberia', code: 'LR' },
  { nameAr: 'ليختنشتاين', nameEn: 'Liechtenstein', code: 'LI' },
  { nameAr: 'ليتوانيا', nameEn: 'Lithuania', code: 'LT' },
  { nameAr: 'لوكسمبورغ', nameEn: 'Luxembourg', code: 'LU' },
  { nameAr: 'مدغشقر', nameEn: 'Madagascar', code: 'MG' },
  { nameAr: 'ملاوي', nameEn: 'Malawi', code: 'MW' },
  { nameAr: 'ماليزيا', nameEn: 'Malaysia', code: 'MY' },
  { nameAr: 'المالديف', nameEn: 'Maldives', code: 'MV' },
  { nameAr: 'مالي', nameEn: 'Mali', code: 'ML' },
  { nameAr: 'مالطا', nameEn: 'Malta', code: 'MT' },
  { nameAr: 'جزر مارشال', nameEn: 'Marshall Islands', code: 'MH' },
  { nameAr: 'موريشيوس', nameEn: 'Mauritius', code: 'MU' },
  { nameAr: 'المكسيك', nameEn: 'Mexico', code: 'MX' },
  { nameAr: 'ميكرونيسيا', nameEn: 'Micronesia', code: 'FM' },
  { nameAr: 'مولدوفا', nameEn: 'Moldova', code: 'MD' },
  { nameAr: 'موناكو', nameEn: 'Monaco', code: 'MC' },
  { nameAr: 'منغوليا', nameEn: 'Mongolia', code: 'MN' },
  { nameAr: 'الجبل الأسود', nameEn: 'Montenegro', code: 'ME' },
  { nameAr: 'موزمبيق', nameEn: 'Mozambique', code: 'MZ' },
  { nameAr: 'ميانمار', nameEn: 'Myanmar', code: 'MM' },
  { nameAr: 'ناميبيا', nameEn: 'Namibia', code: 'NA' },
  { nameAr: 'ناورو', nameEn: 'Nauru', code: 'NR' },
  { nameAr: 'نيبال', nameEn: 'Nepal', code: 'NP' },
  { nameAr: 'هولندا', nameEn: 'Netherlands', code: 'NL' },
  { nameAr: 'نيوزيلندا', nameEn: 'New Zealand', code: 'NZ' },
  { nameAr: 'نيكاراغوا', nameEn: 'Nicaragua', code: 'NI' },
  { nameAr: 'النيجر', nameEn: 'Niger', code: 'NE' },
  { nameAr: 'نيجيريا', nameEn: 'Nigeria', code: 'NG' },
  { nameAr: 'مقدونيا الشمالية', nameEn: 'North Macedonia', code: 'MK' },
  { nameAr: 'النرويج', nameEn: 'Norway', code: 'NO' },
  { nameAr: 'باكستان', nameEn: 'Pakistan', code: 'PK' },
  { nameAr: 'بالاو', nameEn: 'Palau', code: 'PW' },
  { nameAr: 'بنما', nameEn: 'Panama', code: 'PA' },
  { nameAr: 'بابوا غينيا الجديدة', nameEn: 'Papua New Guinea', code: 'PG' },
  { nameAr: 'باراغواي', nameEn: 'Paraguay', code: 'PY' },
  { nameAr: 'بيرو', nameEn: 'Peru', code: 'PE' },
  { nameAr: 'الفلبين', nameEn: 'Philippines', code: 'PH' },
  { nameAr: 'بولندا', nameEn: 'Poland', code: 'PL' },
  { nameAr: 'البرتغال', nameEn: 'Portugal', code: 'PT' },
  { nameAr: 'رومانيا', nameEn: 'Romania', code: 'RO' },
  { nameAr: 'روسيا', nameEn: 'Russia', code: 'RU' },
  { nameAr: 'رواندا', nameEn: 'Rwanda', code: 'RW' },
  { nameAr: 'سانت كيتس ونيفيس', nameEn: 'Saint Kitts and Nevis', code: 'KN' },
  { nameAr: 'سانت لوسيا', nameEn: 'Saint Lucia', code: 'LC' },
  { nameAr: 'سانت فينسنت والغرينادين', nameEn: 'Saint Vincent and the Grenadines', code: 'VC' },
  { nameAr: 'ساموا', nameEn: 'Samoa', code: 'WS' },
  { nameAr: 'سان مارينو', nameEn: 'San Marino', code: 'SM' },
  { nameAr: 'ساو تومي وبرينسيبي', nameEn: 'Sao Tome and Principe', code: 'ST' },
  { nameAr: 'السنغال', nameEn: 'Senegal', code: 'SN' },
  { nameAr: 'صربيا', nameEn: 'Serbia', code: 'RS' },
  { nameAr: 'سيشل', nameEn: 'Seychelles', code: 'SC' },
  { nameAr: 'سيراليون', nameEn: 'Sierra Leone', code: 'SL' },
  { nameAr: 'سنغافورة', nameEn: 'Singapore', code: 'SG' },
  { nameAr: 'سلوفاكيا', nameEn: 'Slovakia', code: 'SK' },
  { nameAr: 'سلوفينيا', nameEn: 'Slovenia', code: 'SI' },
  { nameAr: 'جزر سليمان', nameEn: 'Solomon Islands', code: 'SB' },
  { nameAr: 'جنوب أفريقيا', nameEn: 'South Africa', code: 'ZA' },
  { nameAr: 'جنوب السودان', nameEn: 'South Sudan', code: 'SS' },
  { nameAr: 'إسبانيا', nameEn: 'Spain', code: 'ES' },
  { nameAr: 'سريلانكا', nameEn: 'Sri Lanka', code: 'LK' },
  { nameAr: 'سورينام', nameEn: 'Suriname', code: 'SR' },
  { nameAr: 'سوازيلاند', nameEn: 'Eswatini', code: 'SZ' },
  { nameAr: 'السويد', nameEn: 'Sweden', code: 'SE' },
  { nameAr: 'سويسرا', nameEn: 'Switzerland', code: 'CH' },
  { nameAr: 'طاجيكستان', nameEn: 'Tajikistan', code: 'TJ' },
  { nameAr: 'تنزانيا', nameEn: 'Tanzania', code: 'TZ' },
  { nameAr: 'تايلاند', nameEn: 'Thailand', code: 'TH' },
  { nameAr: 'توغو', nameEn: 'Togo', code: 'TG' },
  { nameAr: 'تونغا', nameEn: 'Tonga', code: 'TO' },
  { nameAr: 'ترينيداد وتوباغو', nameEn: 'Trinidad and Tobago', code: 'TT' },
  { nameAr: 'تركيا', nameEn: 'Turkey', code: 'TR' },
  { nameAr: 'تركمانستان', nameEn: 'Turkmenistan', code: 'TM' },
  { nameAr: 'توفالو', nameEn: 'Tuvalu', code: 'TV' },
  { nameAr: 'أوغندا', nameEn: 'Uganda', code: 'UG' },
  { nameAr: 'أوكرانيا', nameEn: 'Ukraine', code: 'UA' },
  { nameAr: 'المملكة المتحدة', nameEn: 'United Kingdom', code: 'GB' },
  { nameAr: 'الولايات المتحدة', nameEn: 'United States', code: 'US' },
  { nameAr: 'أوروغواي', nameEn: 'Uruguay', code: 'UY' },
  { nameAr: 'أوزبكستان', nameEn: 'Uzbekistan', code: 'UZ' },
  { nameAr: 'فانواتو', nameEn: 'Vanuatu', code: 'VU' },
  { nameAr: 'الفاتيكان', nameEn: 'Vatican City', code: 'VA' },
  { nameAr: 'فنزويلا', nameEn: 'Venezuela', code: 'VE' },
  { nameAr: 'فيتنام', nameEn: 'Vietnam', code: 'VN' },
  { nameAr: 'زامبيا', nameEn: 'Zambia', code: 'ZM' },
  { nameAr: 'زيمبابوي', nameEn: 'Zimbabwe', code: 'ZW' },
];

/**
 * البحث في قائمة الدول
 * @param query نص البحث
 * @returns قائمة الدول المطابقة
 */
export function searchCountries(query: string): Country[] {
  if (!query || query.trim() === '') {
    return COUNTRIES;
  }
  
  const lowerQuery = query.toLowerCase().trim();
  
  return COUNTRIES.filter(country => 
    country.nameAr.toLowerCase().includes(lowerQuery) ||
    country.nameEn.toLowerCase().includes(lowerQuery) ||
    country.code.toLowerCase().includes(lowerQuery)
  );
}

/**
 * الحصول على دولة بواسطة الكود
 */
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

/**
 * الحصول على دولة بواسطة الاسم العربي
 */
export function getCountryByNameAr(nameAr: string): Country | undefined {
  return COUNTRIES.find(c => c.nameAr === nameAr);
}
