import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';

export interface CategoryInput {
  name: string;
  slug: string;
  thumbnail?: string;
  parentId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {}

  async create(input: CategoryInput) {
    const doc = new this.categoryModel({
      ...input,
      parentId: input.parentId ?? null,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
    });
    return doc.save();
  }

  async update(id: string, input: Partial<CategoryInput>) {
    return this.categoryModel
      .findByIdAndUpdate(
        id,
        {
          ...input,
          ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
        },
        { new: true },
      )
      .lean();
  }

  async delete(id: string) {
    // delete category and optionally its direct children (you may refine later)
    await this.categoryModel.deleteMany({ $or: [{ _id: id }, { parentId: id }] });
    return { deleted: true };
  }

  async findAllFlat() {
    return this.categoryModel.find().sort({ parentId: 1, sortOrder: 1, name: 1 }).lean();
  }

  async findOne(id: string) {
    return this.categoryModel.findById(id).lean();
  }

  async findTree() {
    const all = await this.findAllFlat();
    const byId = new Map<string, any>();
    const roots: any[] = [];
    for (const c of all) {
      (c as any).children = [];
      byId.set(String(c._id), c);
    }
    for (const c of all) {
      const pid = c.parentId;
      if (pid && byId.has(pid)) {
        (byId.get(pid) as any).children.push(c);
      } else {
        roots.push(c);
      }
    }
    return roots;
  }
}
