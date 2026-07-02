import { 
  pgTable, 
  serial, 
  text, 
  integer, 
  varchar, 
  index,
  numeric
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Таблица нашего наличия (Зеркало из МоегоСклада)
export const mySkladProducts = pgTable("my_sklad_products", {
  id: varchar("id", { length: 255 }).primaryKey(), // ID из МоегоСклада
  title: text("title").notNull(),
  price: numeric("price").notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0), // Остаток в подвале
  originalOem: varchar("original_oem", { length: 255 }), // Как записано в МС
  cleanOemNumber: varchar("clean_oem_number", { length: 255 }).notNull(), // Очищенный от пробелов и дефисов артикул
}, (table) => ({
  cleanOemIdx: index("idx_ms_clean_oem").on(table.cleanOemNumber),
}));

// 2. Модификации автомобилей (K-Type / Vehicle_ID)
export const tecdocVehicles = pgTable("tecdoc_vehicles", {
  id: integer("id").primaryKey(), // Внутренний ID TecDoc (K-Type)
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  yearStart: integer("year_start"),
  yearEnd: integer("year_end"),
  engineDetails: text("engine_details"),
});

// 3. Маски VIN кодов (WMI + VDS)
export const tecdocVinMasks = pgTable("tecdoc_vin_masks", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => tecdocVehicles.id),
  mask: varchar("mask", { length: 20 }).notNull(), // Например: WBAVA110
}, (table) => ({
  maskIdx: index("idx_vin_mask").on(table.mask),
}));

// 4. Справочник артикулов TecDoc
export const tecdocArticles = pgTable("tecdoc_articles", {
  id: integer("id").primaryKey(),
  brand: varchar("brand", { length: 100 }),
  oemNumber: varchar("oem_number", { length: 255 }).notNull(),
  cleanOemNumber: varchar("clean_oem_number", { length: 255 }).notNull(), // Для JOIN'а с нашей таблицей my_sklad
}, (table) => ({
  cleanOemIdx: index("idx_td_clean_oem").on(table.cleanOemNumber),
}));

// 5. Кросс-таблица: Применяемость деталей к автомобилям
export const tecdocCrossReferences = pgTable("tecdoc_cross_references", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull().references(() => tecdocVehicles.id),
  articleId: integer("article_id").notNull().references(() => tecdocArticles.id),
}, (table) => ({
  vehicleArticleIdx: index("idx_vehicle_article").on(table.vehicleId, table.articleId),
}));

// --- Настройка связей (Relations) для Drizzle ---

export const tecdocVehiclesRelations = relations(tecdocVehicles, ({ many }) => ({
  masks: many(tecdocVinMasks),
  crossReferences: many(tecdocCrossReferences),
}));

export const tecdocArticlesRelations = relations(tecdocArticles, ({ many }) => ({
  crossReferences: many(tecdocCrossReferences),
}));
