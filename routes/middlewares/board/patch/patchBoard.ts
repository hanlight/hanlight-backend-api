import { NextFunction, Request, Response } from 'express';

import CustomError from '@Middleware/error/customError';

import Board from '@Model/board.model';
import BoardImage from '@Model/boardImage.model';
import BoardPatchLog from '@Model/boardPatchLog.model';
import User from '@Model/user.model';

const patchBoard = async (req: Request, res: Response, next: NextFunction) => {
  const user: User = res.locals.user;
  const board_pk: Board['pk'] = req.body.board_pk;
  const current_content: Board['content'] = req.body.content;

  try {
    const past_board: Board = await Board.findOne({
      where: {
        pk: board_pk,
        user_pk: user.pk,
      },
      include: [
        {
          model: User,
          attributes: ['name'],
          as: 'user',
        },
        {
          model: BoardImage,
          as: 'boardImage',
        },
      ],
    });

    if (past_board) {
      if (past_board.content === current_content) {
        res.sendStatus(204);
      } else {
        const [current_board]: [Board, unknown] = await Promise.all([
          past_board.update({
            content: current_content,
          }),
          BoardPatchLog.create({
            board_pk,
            user_pk: user.pk,
            user_name: user.name,
            type: 'board',
            past_content: past_board.content,
          }),
        ]);

        res.json({
          success: true,
          data: {
            board: {
              pk: current_board.pk,
              user_name: current_board.user.name,
              user_image:
                current_board.user.name && user.image
                  ? `https://s3.ap-northeast-2.amazonaws.com/hanlight/profile-image/${user.image}`
                  : null,
              content: current_board.content,
              files: current_board.boardImage.map(
                (boardImage: BoardImage) => `https://s3.ap-northeast-2.amazonaws.com/hanlight/board/${boardImage.file}`
              ),
              createdAt: current_board.createdAt,
            },
          },
        });
      }
    } else {
      next(new CustomError({ name: 'Not_Found_Board' }));
    }
  } catch (error) {
    console.log(error);
    next(new CustomError({ name: 'Database_Error' }));
  }
};

export default patchBoard;
