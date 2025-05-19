import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.dto';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('/')
  async getAllPosts() {
    return await this.postsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async create(@Body() createPostDto: CreatePostDto, @CurrentUser() user: User) {
    return await this.postsService.create(createPostDto, user);
  }

  @Get('/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: CreatePostDto,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.update(id, updatePostDto, user);
  }
}
