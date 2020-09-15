import {
	Controller,
	UseGuards,
	HttpStatus,
	Post,
	Body,
	UseInterceptors
} from '@nestjs/common';
import { Screenshot } from '../screenshot.entity';
import { CrudController } from '../../core/crud/crud.controller';
import { ScreenshotService } from './screenshot.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as moment from 'moment';
import * as sharp from 'sharp';
import { FileStorage } from '../../core/file-storage';
import { UploadedFileStorage } from '../../core/file-storage/uploaded-file-storage';
import * as Jimp from 'jimp';

@ApiTags('Screenshot')
@UseGuards(AuthGuard('jwt'))
@Controller('screenshot')
export class ScreenshotController extends CrudController<Screenshot> {
	constructor(private readonly screenshotService: ScreenshotService) {
		super(screenshotService);
	}

	@ApiOperation({ summary: 'Add manual time' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The timer has been successfully On/Off.'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description:
			'Invalid input, The response body may contain clues as to what went wrong'
	})
	@Post('/')
	@UseInterceptors(
		FileInterceptor('file', {
			storage: new FileStorage().storage({
				dest: () => {
					return path.join(
						'screenshots',
						moment().format('YYYY/MM/DD')
					);
				},
				prefix: 'screenshots'
			})
		})
	)
	async upload(
		@Body() entity: Screenshot,
		@UploadedFileStorage()
		file
	): Promise<Screenshot> {
		console.log('upload', { file });
		const thumbName = `thumb-${file.filename}`;

		let fileContent;
		try {
			fileContent = await new FileStorage()
				.getProvider()
				.getFile(file.key, true);
		} catch (error) {}

		//const fileBuffer = Buffer.from(fileContent);

		let data = await sharp(fileContent)
			.resize(250, 150)
			.toBuffer({ resolveWithObject: true })
			.then((img) => {
				console.log('{ img: img.toString() }');
				return img;
			})
			.catch((error) => {
				console.log({ error });
			});

		data = await Jimp.read(fileContent)
			.then(async (lenna) => {
				console.log('{ lenna }');
				// return await lenna
				// 	.resize(250, 150) // resize
				// 	.getBufferAsync(Jimp.AUTO); // save
			})
			.catch((err) => {
				console.log({ err });
				// Handle an exception.
			});
		console.log({ data });

		//await new FileStorage().getProvider().putFile(data);
		// .toFile(path.join(file.destination, thumbName), (err, info) => {
		// 	if (err) {
		// 		reject(err);
		// 		return;
		// 	}
		// 	resolve(info);
		// });

		entity.file = path.join(
			'screenshots',
			moment().format('YYYY/MM/DD'),
			file.filename
		);
		entity.thumb = path.join(
			'screenshots',
			moment().format('YYYY/MM/DD'),
			thumbName
		);
		entity.recordedAt = entity.recordedAt ? entity.recordedAt : new Date();
		const screenshot = await this.screenshotService.create(entity);

		return this.screenshotService.findOne(screenshot.id);
	}
}
