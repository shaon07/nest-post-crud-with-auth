import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decoratos';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User, UserRole } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
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

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.postsService.delete(id);
  }
}
