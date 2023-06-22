
import * as express from 'express';
const router = express.Router();

router.get('/', async (req: any, res: any) => {
    console.log("got!");
    console.log(req.header('authorization'), req.header('item_id'));
    res.status(200).json({result: [
        {
            "review_id": 12234134,
            "content": "maze aa gaye bro ye chiz leke",
            "user_name": "Bawa Singh",
            "date_added": "19 March 2023",
            "rating": 5
        }
    ]});
})

router.post('/', async (req: any, res: any) => {
    console.log("posted!");
    console.log(req.body.jwtToken, req.body.itemId, req.body.rating, req.body.review);
    res.status(201).json({succ: true});
})

export default router;