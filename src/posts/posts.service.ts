import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(@InjectRepository(Post) private postRepository: Repository<Post>) {}
  async findAll() {
    const posts = await this.postRepository.find({
      relations: ['author'],
    });
    return plainToInstance(Post, posts);
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return plainToInstance(Post, post);
  }

  async create(createPostDto: CreatePostDto, user: User) {
    const post = this.postRepository.create(createPostDto);
    post.author = user;
    return await this.postRepository.save(post);
  }

  async update(id: number, updatePostDto: Partial<CreatePostDto>, user: User) {
    const post = await this.postRepository.findOne({ where: { id }, relations: ['author'] });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author.id !== user.id) {
      throw new NotFoundException('You are not authorized to update this post');
    }

    Object.assign(post, updatePostDto);
    const updatedPost = await this.postRepository.save(post);
    return plainToInstance(Post, updatedPost);
  }
}
