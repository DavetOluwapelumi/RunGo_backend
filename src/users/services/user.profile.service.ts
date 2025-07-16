import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from 'src/entities/users.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UserProfileService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async uploadProfileImage(userId: string, file: Express.Multer.File) {
        console.log('Upload service called with:', { userId, file: file?.filename });

        if (!file) {
            console.log('No file provided');
            throw new BadRequestException('No file uploaded');
        }

        // Validate file type
        if (!file.mimetype.match(/^image\/(jpeg|png|gif|webp)$/)) {
            console.log('Invalid file type:', file.mimetype);
            throw new BadRequestException('Only image files (jpeg, png, gif, webp) are allowed');
        }

        try {
            // The file is already saved with the correct extension by the controller
            const imageUrl = `/uploads/profile-images/${file.filename}`;
            const imagePath = file.path;

            console.log('Generated paths:', { imageUrl, imagePath });

            // Update user
            const updateResult = await this.userRepository.update(userId, {
                profileImageUrl: imageUrl,
                profileImagePath: imagePath,
            });

            console.log('Database update result:', updateResult);

            return { imageUrl };
        } catch (error) {
            console.error('Error in uploadProfileImage:', error);
            throw error;
        }
    }

    async deleteProfileImage(userId: string) {
        const user = await this.userRepository.findOne({ where: { identifier: userId } });
        if (user?.profileImagePath && fs.existsSync(user.profileImagePath)) {
            fs.unlinkSync(user.profileImagePath);
        }
        await this.userRepository.update(userId, {
            profileImageUrl: null,
            profileImagePath: null,
        });
        return { message: 'Profile image deleted' };
    }

    async getProfile(userId: string) {
        return this.userRepository.findOne({ where: { identifier: userId } });
    }
}
