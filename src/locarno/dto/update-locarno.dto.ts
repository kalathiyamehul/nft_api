import { PartialType } from '@nestjs/swagger';
export class NearByUserDto {
    latitude: string
    longitude: string
    meter: number
}

export class recentActivity {
    limit?: number;
    user_id: number
}