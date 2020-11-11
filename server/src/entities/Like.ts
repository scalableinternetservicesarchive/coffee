import { Index, BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Cafe } from './Cafe'
import { User } from './User'

@Entity()
@Index(["userId", "cafeId"], { unique: true })
export class Like extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User, user => user.likes)
  @JoinColumn({ name: 'userId' })
  user: User

  @ManyToOne(() => Cafe, cafe => cafe.likes)
  @JoinColumn({ name: 'cafeId' })
  cafe: Cafe

  @Column({ nullable: false })
  userId: number

  @Column({ nullable: false })
  cafeId: number
}
