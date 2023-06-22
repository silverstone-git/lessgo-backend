
import * as express from 'express';
import * as reviewsRepo from '../repositories/reviews_repository';
import isAuthed from '../repositories/authorizer';
const router = express.Router();

router.get('/', async (req: any, res: any) => {
    const result: Array<any> = await reviewsRepo.getReviews(req.header('item_id'));
    res.status(200).json({result: JSON.stringify(result)});
})

router.post('/', async (req: any, res: any) => {

	let jwtVerify: any = isAuthed(req.body["Authorization"]);
	if(Object.keys(jwtVerify).length === 0) {
		res.status(403).json({"succ": false, "message": "Forbidden"});
		return;
	}

    const exitCode = await reviewsRepo.postReviews(jwtVerify.userId, req.body.itemId, req.body.review, req.body.rating);
    res.status(exitCode === 1 ? 400 : 200).json({succ: true});
})

export default router;