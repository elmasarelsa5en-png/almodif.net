'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Utensils, ArrowLeft, Sparkles, Star, Plus, ShoppingCart, 
  CreditCard, Clock, Heart, Award, Zap, Crown, Timer,
  Flame, Snowflake, Cookie, Croissant, ChefHat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

// Professional TypeScript interfaces
interface RestaurantItem {
  id: string;
  name: string;
  nameAr: string;
  category: 'appetizers' | 'main-courses' | 'grilled' | 'seafood' | 'desserts' | 'beverages';
  price: number;
  image: string;
  description: string;
  rating: number;
  preparationTime: number;
  available: boolean;
  featured?: boolean;
  calories?: number;
  ingredients: string[];
  spicy?: boolean;
  vegetarian?: boolean;
}

interface CartItem extends RestaurantItem {
  quantity: number;
}

// Animation variants for professional micro-interactions
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.5 }
  }
};

// Premium restaurant menu data
const RESTAURANT_MENU: RestaurantItem[] = [
  {
    id: '1',
    name: 'Grilled Salmon',
    nameAr: 'سلمون مشوي',
    category: 'seafood',
    price: 85,
    image: '🐟',
    description: 'سلمون طازج مشوي مع توابل البحر الأبيض المتوسط وخضار مشوية',
    rating: 4.9,
    preparationTime: 15,
    available: true,
    featured: true,
    calories: 320,
    ingredients: ['سلمون طازج', 'زيت زيتون', 'ليمون', 'توابل بحر متوسط', 'خضار مشوية']
  },
  {
    id: '2',
    name: 'Beef Steak',
    nameAr: 'ستيك لحم',
    category: 'grilled',
    price: 120,
    image: '🥩',
    description: 'ستيك لحم بقري طري مشوي على درجة النضج المثالية مع صلصة الخردل',
    rating: 4.8,
    preparationTime: 20,
    available: true,
    featured: true,
    calories: 450,
    ingredients: ['لحم بقري', 'ملح البحر', 'فلفل أسود', 'زيت زيتون', 'ثوم']
  },
  {
    id: '3',
    name: 'Chicken Shawarma',
    nameAr: 'شاورما دجاج',
    category: 'main-courses',
    price: 45,
    image: '🍗',
    description: 'دجاج مشوي بالتوابل الشرقية مع خبز عربي طازج وسلطة',
    rating: 4.7,
    preparationTime: 12,
    available: true,
    calories: 380,
    ingredients: ['دجاج طازج', 'توابل شاورما', 'خبز عربي', 'طحينة', 'خضار طازجة']
  },
  {
    id: '4',
    name: 'Caesar Salad',
    nameAr: 'سلطة سيزر',
    category: 'appetizers',
    price: 35,
    image: '�',
    description: 'سلطة سيزر كلاسيكية مع صلصة السيزر الحقيقية وخبز محمص',
    rating: 4.6,
    preparationTime: 8,
    available: true,
    vegetarian: true,
    calories: 280,
    ingredients: ['خس روماني', 'خبز محمص', 'جبن بارميزان', 'صلصة سيزر', 'دجاج مشوي']
  },
  {
    id: '5',
    name: 'Chocolate Lava Cake',
    nameAr: 'كعكة لافا شوكولاتة',
    category: 'desserts',
    price: 28,
    image: '🍫',
    description: 'كعكة شوكولاتة دافئة مع قلب شوكولاتة سائل وآيس كريم فانيليا',
    rating: 4.9,
    preparationTime: 10,
    available: true,
    featured: true,
    calories: 420,
    ingredients: ['شوكولاتة داكنة', 'زبدة', 'بيض', 'سكر', 'آيس كريم فانيليا']
  },
  {
    id: '6',
    name: 'Fresh Orange Juice',
    nameAr: 'عصير برتقال طازج',
    category: 'beverages',
    price: 15,
    image: '�',
    description: 'عصير برتقال طازج 100% بدون إضافات أو مواد حافظة',
    rating: 4.5,
    preparationTime: 3,
    available: true,
    calories: 110,
    ingredients: ['برتقال طازج', 'ماء']
  }
];

export default function RestaurantPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Professional memoized computations
  const filteredMenu = useMemo(() => {
    if (selectedCategory === 'all') return RESTAURANT_MENU;
    return RESTAURANT_MENU.filter(item => item.category === selectedCategory);
  }, [selectedCategory]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Professional cart management functions
  const addToCart = (item: RestaurantItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'appetizers': return <Utensils className="h-5 w-5" />;
      case 'main-courses': return <ChefHat className="h-5 w-5" />;
      case 'grilled': return <Flame className="h-5 w-5" />;
      case 'seafood': return <Snowflake className="h-5 w-5" />;
      case 'desserts': return <Cookie className="h-5 w-5" />;
      case 'beverages': return <Croissant className="h-5 w-5" />;
      default: return <Utensils className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium background with animated gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-900 to-yellow-900" />
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-transparent to-orange-500/20" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-10"
            animate={{
              y: [0, -30, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 10
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            <Utensils className="w-6 h-6 text-amber-300" />
          </motion.div>
        ))}
      </div>

      {/* Professional Header */}
      <motion.header 
        className="relative z-50 bg-black/20 backdrop-blur-2xl border-b border-amber-500/20"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                onClick={() => router.push('/guest-menu')}
                className="text-white border-amber-400/50 hover:bg-amber-500/20 hover:border-amber-400"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                العودة للقائمة الرئيسية
              </Button>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <div className="flex items-center gap-4 justify-center">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-xl">
                    <Utensils className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Crown className="h-5 w-5 text-yellow-400" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-yellow-200 bg-clip-text text-transparent">
                    مطعم فاخر
                  </h1>
                  <p className="text-amber-300 text-sm font-medium">Fine Dining Experience</p>
                </div>
              </div>
            </motion.div>
            
            {/* Cart button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                السلة
                {cartItemsCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                    {cartItemsCount}
                  </Badge>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <motion.div
            className="lg:col-span-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="bg-white/10 backdrop-blur-xl border-amber-400/20 shadow-2xl sticky top-24">
              <CardHeader>
                <CardTitle className="text-amber-200 flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  الفئات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[ 
                  { id: 'all', label: 'جميع الأطباق', icon: <Star className="h-4 w-4" /> },
                  { id: 'appetizers', label: 'المقبلات', icon: <Utensils className="h-4 w-4" /> },
                  { id: 'main-courses', label: 'الأطباق الرئيسية', icon: <ChefHat className="h-4 w-4" /> },
                  { id: 'grilled', label: 'المشويات', icon: <Flame className="h-4 w-4" /> },
                  { id: 'seafood', label: 'المأكولات البحرية', icon: <Snowflake className="h-4 w-4" /> },
                  { id: 'desserts', label: 'الحلويات', icon: <Cookie className="h-4 w-4" /> },
                  { id: 'beverages', label: 'المشروبات', icon: <Croissant className="h-4 w-4" /> }
                ].map((category) => (
                  <motion.div key={category.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full justify-start text-right ${
                        selectedCategory === category.id
                          ? 'bg-amber-500 text-white shadow-lg'
                          : 'text-amber-200 hover:bg-amber-500/20'
                      }`}
                    >
                      {category.icon}
                      <span className="mr-2">{category.label}</span>
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Menu Grid */}
          <div className="lg:col-span-3">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredMenu.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    layout
                    className="group"
                  >
                    <Card className="bg-white/5 backdrop-blur-xl border-amber-400/20 hover:border-amber-400/40 transition-all duration-500 overflow-hidden shadow-2xl hover:shadow-amber-500/25 h-full">
                      {/* Item image and badges */}
                      <div className="relative h-48 bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div 
                            className="text-6xl group-hover:scale-110 transition-transform duration-300"
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                          >
                            {item.image}
                          </motion.div>
                        </div>
                        
                        {/* Price badge */}
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg px-3 py-2 shadow-lg">
                            {item.price} ريال
                          </Badge>
                        </div>

                        {/* Featured badge */}
                        {item.featured && (
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              <Crown className="h-3 w-3 mr-1" />
                              مميز
                            </Badge>
                          </div>
                        )}

                        {/* Category badge */}
                        <div className="absolute bottom-4 left-4">
                          <Badge variant="outline" className="bg-white/90 text-amber-800 border-amber-400">
                            {getCategoryIcon(item.category)}
                            <span className="mr-1 text-xs">
                              {item.category === 'appetizers' ? 'مقبلات' :
                               item.category === 'main-courses' ? 'أطباق رئيسية' :
                               item.category === 'grilled' ? 'مشويات' :
                               item.category === 'seafood' ? 'مأكولات بحرية' :
                               item.category === 'desserts' ? 'حلويات' : 'مشروبات'}
                            </span>
                          </Badge>
                        </div>
                      </div>

                      {/* Item details */}
                      <CardContent className="p-6 text-white">
                        <div className="space-y-4">
                          {/* Title and rating */}
                          <div>
                            <h3 className="text-xl font-bold text-amber-200 mb-1">
                              {item.nameAr}
                            </h3>
                            <p className="text-amber-300/80 text-sm mb-2">
                              {item.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.floor(item.rating)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-400'
                                    }`}
                                  />
                                ))}
                                <span className="text-yellow-400 text-sm mr-1">
                                  {item.rating}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs text-amber-300 border-amber-400">
                                <Timer className="h-3 w-3 mr-1" />
                                {item.preparationTime} دقيقة
                              </Badge>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-amber-100/90 text-sm leading-relaxed">
                            {item.description}
                          </p>

                          {/* Calories and ingredients */}
                          <div className="flex items-center gap-4 text-xs">
                            {item.calories && (
                              <Badge variant="outline" className="text-amber-300 border-amber-400">
                                <Zap className="h-3 w-3 mr-1" />
                                {item.calories} سعرة
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-amber-300 border-amber-400">
                              {item.ingredients.length} مكونات
                            </Badge>
                          </div>

                          {/* Add to cart button */}
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              onClick={() => addToCart(item)}
                              disabled={!item.available}
                              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <Plus className="h-5 w-5 mr-2" />
                              {item.available ? 'إضافة للسلة' : 'غير متوفر'}
                            </Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Professional Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-96 bg-black/90 backdrop-blur-2xl border-l border-amber-400/20 z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-amber-200">السلة</h2>
                <Button
                  variant="ghost"
                  onClick={() => setIsCartOpen(false)}
                  className="text-amber-200 hover:bg-amber-500/20"
                >
                  ×
                </Button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingCart className="h-16 w-16 text-amber-400/50 mx-auto mb-4" />
                  <p className="text-amber-300">السلة فارغة</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      className="bg-white/5 rounded-xl p-4 border border-amber-400/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{item.image}</div>
                        <div className="flex-1">
                          <h4 className="text-amber-200 font-semibold">{item.nameAr}</h4>
                          <p className="text-amber-300/80 text-sm">{item.price} ريال</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0 text-amber-300 border-amber-400"
                          >
                            -
                          </Button>
                          <span className="text-white w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0 text-amber-300 border-amber-400"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  <div className="mt-6 pt-4 border-t border-amber-400/20">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold text-amber-200">الإجمالي:</span>
                      <span className="text-2xl font-bold text-green-400">{cartTotal} ريال</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3">
                      <CreditCard className="h-5 w-5 mr-2" />
                      إتمام الطلب
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for cart */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsCartOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}