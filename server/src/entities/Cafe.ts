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

  @Column({ nullable: true })
  images: string[]

  likes: Like[]
}
