import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true, trim: true })
  slug!: string; // URL-safe identifier, e.g. "school-supplies"

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop()
  thumbnail?: string; // image URL

  @Prop({ type: String, default: null, index: true })
  parentId?: string | null; // null for root categories

  @Prop({ type: Number, default: 0 })
  sortOrder!: number; // for ordering within same parent

  @Prop({ default: true })
  isActive!: boolean;
}

export type CategoryDocument = HydratedDocument<Category>;
export const CategorySchema = SchemaFactory.createForClass(Category);
