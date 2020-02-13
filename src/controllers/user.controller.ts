import { Router } from 'express';
import { UserManager } from '../managers';
import { JoiValidator } from '../config';
import { UserSchema } from '../schema';

export class UserController {
	public static route = '/send';
	public router: Router;
	private userManager: UserManager;
	private joiValidator: JoiValidator;

	constructor() {
		this.userManager = new UserManager();
		this.joiValidator = new JoiValidator();
		this.router = Router();
		this.init();
	}

	public init() {
		this.router.post('/', this.ping);
		this.router.get('/all', this.GetAllMessages)
	}

	public ping = async (request, response, nextFunction) => {
		try {
			const result = request.body;
			const validatedResponse = await this.joiValidator.jsonValidator(
				new UserSchema().getPingResponse(),
				result
			);
			await this.userManager.publishMessage(validatedResponse);
			response.send(validatedResponse);
		} catch (error) {
			response.status(500).send(error);
		}
	};

	public GetAllMessages = async (request, response, nextFunction) => {
		try {
			let result = await this.userManager.GetAllMessages();
			response.send({ data: result.length ? JSON.parse(result) : [] });
		} catch (error) {
			response.status(500).send(error);
		}
	}
}
