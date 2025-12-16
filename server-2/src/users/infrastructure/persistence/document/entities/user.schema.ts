import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';

import { AuthProvidersEnum } from '@/auth/auth-providers.enum';
import { EntityDocumentHelper } from '@/utils/document-entity-helper';
import { RoleEnum } from '@/roles/roles.enum';

export type UserSchemaDocument = HydratedDocument<UserSchemaClass>;

@Schema({
  collection: 'users',
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class UserSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: String,
    unique: true,
  })
  email: string | null;

  @Prop()
  password?: string;

  @Prop({
    default: AuthProvidersEnum.email,
  })
  provider: string;

  @Prop({
    type: String,
    default: null,
  })
  picture?: string | null;

  @Prop({
    type: String,
    default: null,
  })
  socialId?: string | null;

  @Prop({
    type: String,
  })
  name: string;

  @Prop({
    type: Array,
    default: [],
  })
  categories: string[];

  @Prop({
    type: String,
  })
  refreshToken: string;

  @Prop({
    type: String,
    default: RoleEnum.user,
  })
  role: string;

  @Prop({
    type: Array,
    default: [],
  })
  statuses: string[];

  @Prop({
    type: Boolean,
  })
  isUserQuestDone: boolean;

  @Prop({
    type: String,
  })
  team?: string | null;

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserSchemaClass);
