import { ApiModelProperty } from '@nestjs/swagger';
import { city } from '../interfaces/entities/city';
import { country } from '../interfaces/entities/country';
import { region } from '../interfaces/entities/region';
import { device } from '../interfaces/entities/device';
import { os } from '../interfaces/entities/os';
import { isp } from '../interfaces/entities/isp';
import { browser } from '../interfaces/entities/browser';
import { process_type } from '../interfaces/entities/process_type';
import { session } from '../interfaces/entities/session';
import { user_agent } from '../interfaces/entities/user_agent';


export default class CollectionEventDto {
    @ApiModelProperty()
    readonly id: number;

    @ApiModelProperty()
    readonly name: string;

    @ApiModelProperty()
    readonly timestamp: Date;

    @ApiModelProperty()
    readonly city: city | null;

    @ApiModelProperty()
    readonly region: region | null;
    @ApiModelProperty()
    readonly country: country | null;

    @ApiModelProperty()
    readonly device: device | null;

    @ApiModelProperty()
    readonly isp: isp | null;

    @ApiModelProperty()
    readonly filesize: number | null;

    @ApiModelProperty()
    readonly os: os | null;

    @ApiModelProperty()
    readonly browser: browser | null;

    @ApiModelProperty()
    readonly collection_time: number | null;

    @ApiModelProperty()
    readonly timezone: string | null;

    @ApiModelProperty()
    readonly process_type: process_type | null;

    @ApiModelProperty()
    readonly project_name: string | null;

    @ApiModelProperty()
    readonly worker_id: string | null;

    @ApiModelProperty()
    readonly collection_source: string | null;

    @ApiModelProperty()
    readonly sources: object[] | null;

    @ApiModelProperty()
    readonly session_id: session | null;

    @ApiModelProperty()
    readonly filetype: string | null;

    @ApiModelProperty()
    readonly user_agent: user_agent | null;

    @ApiModelProperty()
    readonly reward: string | null;

    @ApiModelProperty()
    readonly assignment_id: string | null;

    @ApiModelProperty()
    readonly hit_id: string | null;

    @ApiModelProperty()
    readonly api_key: string | null;

    @ApiModelProperty()
    readonly task_type: string | null;
}
