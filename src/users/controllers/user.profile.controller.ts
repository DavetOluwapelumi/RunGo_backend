import {
    Controller, Post, UseInterceptors, UploadedFile, Req, Delete, Get, Body, Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserProfileService } from '../services/user.profile.service';
import { WalletService } from '../../wallet/wallet.service';
import { extname } from 'path';
import { diskStorage } from 'multer';

@Controller({ version: '1', path: 'user/profile' })
export class UserProfileController {
    constructor(
        private readonly profileService: UserProfileService,
        private readonly walletService: WalletService,
    ) { }

    @Get('test')
    async test() {
        console.log('Test endpoint hit!');
        return { message: 'Profile controller is working!' };
    }

    @Get('wallet-balance')
    async getWalletBalance(@Query('email') email: string) {
        console.log('Get wallet balance request for email:', email);
        return this.walletService.getWalletByEmail(email);
    }

    @Post('upload-image')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/profile-images',
            filename: (req, file, cb) => {
                const ext = extname(file.originalname);
                const baseName = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, baseName + ext);
            },
        }),
    }))
    async uploadProfileImage(@UploadedFile() file: Express.Multer.File, @Body('userId') userId: string) {
        if (!file) {
            throw new Error('No file uploaded');
        }
        // Save the image path in the user's record
        const result = await this.profileService.uploadProfileImage(userId, file);
        return {
            success: true,
            data: {
                imageUrl: result.imageUrl,
            },
        };
    }

    @Delete('image')
    async deleteImage(@Body('userId') userId: string) {
        return this.profileService.deleteProfileImage(userId);
    }

    @Post()
    async getProfile(@Body('userId') userId: string) {
        const user = await this.profileService.getProfile(userId);
        return {
            success: true,
            data: user,
        };
    }
}
