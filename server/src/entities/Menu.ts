import { BaseEntity, Column, OneToOne, JoinColumn, Entity } from 'typeorm'
import { Cafe } from './Cafe';

@Entity()
export class Menu extends BaseEntity {
  @OneToOne(() => Cafe)
  @JoinColumn()
  cafe: Cafe
  // NOTE: in a database, this would normally be the cafeId but in this orm, it is implicit and
  // we refer to the direct entity.

  @Column({ nullable: false })
  items: string[]
}
