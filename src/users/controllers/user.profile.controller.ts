import {
    Controller, Post, UseInterceptors, UploadedFile, Req, Delete, Get, Body
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserProfileService } from '../services/user.profile.service';

@Controller({ version: '1', path: 'user/profile' })
export class UserProfileController {
    constructor(private readonly profileService: UserProfileService) { }

    @Get('test')
    async test() {
        console.log('Test endpoint hit!');
        return { message: 'Profile controller is working!' };
    }

    @Post('upload-image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File, @Body('userId') userId: string) {
        console.log('Controller received:', {
            userId,
            file: file?.filename,
            fileSize: file?.size,
            mimetype: file?.mimetype,
            originalname: file?.originalname
        });

        try {
            // In production, extract userId from JWT
            const result = await this.profileService.uploadProfileImage(userId, file);
            console.log('Upload successful:', result);
            return result;
        } catch (error) {
            console.error('Controller error:', error);
            throw error;
        }
    }

    @Delete('image')
    async deleteImage(@Body('userId') userId: string) {
        return this.profileService.deleteProfileImage(userId);
    }

    @Get()
    async getProfile(@Body('userId') userId: string) {
        return this.profileService.getProfile(userId);
    }
}
