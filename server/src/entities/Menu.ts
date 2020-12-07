import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Cafe } from './Cafe'

@Entity()
export class Menu extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number
  @Column({ nullable: false })
  cafeId: number
  @OneToOne(() => Cafe)
  @JoinColumn()
  cafe: Cafe
  // NOTE: in a database, this would normally be the cafeId but in this orm, it is implicit and
  // we refer to the direct entity.

  // TODO: we need to create another joining here since arrays
  // aren't supported in mysql, similar to Cafe (images).
  /*
  @Column({ nullable: false })
  items: string[]
  */
  @Column({ nullable: true })
  menuDescription: string
}
