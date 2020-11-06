import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { Like } from './Like'

@Entity()
export class Cafe extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  name: string

  @Column({ nullable: false })
  longitude: number

  @Column({ nullable: false })
  latitude: number

  // NOTE: arrays like this aren't supporte in mysql.
  // We need to make a joining table images <> Cafe.
  //@Column({ nullable: true })
  //images: string[]

  likes: Like[]
}
