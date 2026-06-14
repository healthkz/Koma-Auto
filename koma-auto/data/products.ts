export interface Product {
  id: string;
  moySkladId?: string;
  article: string;
  brand: string;
  name: string;
  price: number;
  oldPrice?: number;
  inStock: boolean;
  category: string;
  image?: string;
  images?: string[];
  specs: Record<string, string>;
  compatibility: string[];
  description?: string;
}

export const categories = [
  { id: 'interior', name: 'Внутренняя отделка', icon: 'Package' },
  { id: 'engine', name: 'Двигатель', icon: 'Settings' },
  { id: 'service', name: 'Детали для сервиса / проверки / ухода', icon: 'Tool' },
  { id: 'comfort', name: 'Дополнительные удобства', icon: 'Smile' },
  { id: 'lock', name: 'Замок', icon: 'Lock' },
  { id: 'info', name: 'Информационная / коммуникационная система', icon: 'Radio' },
  { id: 'wheels', name: 'Колёса / шины', icon: 'Circle' },
  { id: 'ac', name: 'Кондиционер', icon: 'Wind' },
  { id: 'gearbox', name: 'Коробка передач', icon: 'Settings' },
  { id: 'body', name: 'Кузов', icon: 'Car' },
  { id: 'heating', name: 'Отопление / вентиляция', icon: 'Thermometer' },
  { id: 'suspension', name: 'Подвеска / амортизация', icon: 'Activity' },
  { id: 'axle', name: 'Подвеска оси / система подвески / колеса', icon: 'Disc' },
  { id: 'fuel_mix', name: 'Подготовка топливной смеси', icon: 'Droplet' },
  { id: 'wheel_drive', name: 'Привод колеса', icon: 'Circle' },
  { id: 'belt_drive', name: 'Ременный привод', icon: 'Repeat' },
  { id: 'steering', name: 'Рулевое управление', icon: 'Compass' },
  { id: 'safety', name: 'Система безопасности', icon: 'Shield' },
  { id: 'exhaust', name: 'Система выпуска', icon: 'Cloud' },
  { id: 'ignition', name: 'Система зажигания / накаливания', icon: 'Zap' },
  { id: 'cooling', name: 'Система охлаждения', icon: 'ThermometerSnowflake' },
  { id: 'window_cleaning', name: 'Система очистки окон', icon: 'Droplets' },
  { id: 'headlight_cleaning', name: 'Система очистки фар', icon: 'Eye' },
  { id: 'fuel_supply', name: 'Система подачи топлива', icon: 'Battery' },
  { id: 'clutch', name: 'Система сцепления / навесные части', icon: 'Disc' },
  { id: 'brakes', name: 'Тормозная система', icon: 'Disc' },
  { id: 'filters', name: 'Фильтр', icon: 'Filter' },
  { id: 'electrical', name: 'Электрика', icon: 'Zap' },
];

export const brands = [
  { id: 'bosch', name: 'Bosch' },
  { id: 'brembo', name: 'Brembo' },
  { id: 'mann', name: 'Mann-Filter' },
  { id: 'ngk', name: 'NGK' },
  { id: 'kayaba', name: 'KYB' },
  { id: 'denso', name: 'Denso' },
];

export const products: Product[] = [];
