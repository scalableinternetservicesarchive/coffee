import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { Like } from './Like'
/*
@Entity()
export class User extends BaseEntity implements GraphqlUser {
  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn()
  timeCreated: Date

  @UpdateDateColumn()
  timeUpdated: Date

  @Column({
    length: 100,
  })
  email: string

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.User,
  })
  userType: UserType

  @Column({
    length: 100,
    nullable: true,
  })
  name: string
}
 */

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  hashedPassword: string

  @Column({ nullable: false })
  firstName: string

  @Column({ nullable: false })
  lastName: string

  likes: Like[]
}
