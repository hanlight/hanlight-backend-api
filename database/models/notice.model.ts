import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import NoticeLog from './noticeLog.model';
import User from './user.model';

@Table({
  timestamps: true,
})
export default class Notice extends Model<Notice> {
  @AutoIncrement
  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.INTEGER)
  public pk: number;

  @ForeignKey(() => User)
  @AllowNull(true)
  @Column(DataType.UUID)
  public user_pk: string;

  @Column(DataType.STRING)
  public user_name: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public title: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  public content: string;

  @CreatedAt
  public createdAt: Date;

  @UpdatedAt
  public updatedAt: Date;

  @BelongsTo(() => User)
  public user: User;

  @HasMany(() => NoticeLog)
  public noticeLog: NoticeLog;
}
