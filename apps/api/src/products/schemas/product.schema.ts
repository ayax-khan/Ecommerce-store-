import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, index: true })
  title!: string;

  @Prop()
  description?: string;

  // effective price used on storefront (usually salePrice || regularPrice)
  @Prop({ required: true, index: true })
  price!: number;

  // pricing breakdown
  @Prop({ required: true })
  regularPrice!: number;

  @Prop()
  salePrice?: number;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ type: [String], default: [], index: true })
  categoryIds!: string[];

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ index: true })
  brand?: string;

  @Prop({ default: 0 })
  availableQty!: number; // snapshot for convenience; authoritative in Postgres Inventory

  @Prop({ default: 'in_stock', index: true })
  stockStatus!: 'in_stock' | 'out_of_stock' | 'backorder';

  @Prop()
  weight?: number; // in grams

  @Prop({
    type: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
    },
    _id: false,
  })
  dimensions?: { length?: number; width?: number; height?: number };

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop({
    type: [
      {
        name: { type: String, required: true },
        sku: { type: String },
        price: { type: Number },
        availableQty: { type: Number },
        attributes: { type: Object },
      },
    ],
    default: [],
  })
  variants!: {
    name: string;
    sku?: string;
    price?: number;
    availableQty?: number;
    attributes?: Record<string, any>;
  }[];
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);
