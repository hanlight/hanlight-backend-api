import { NextFunction, Request, Response } from 'express';

import CustomError from '@Middleware/error/customError';

import Board from '@Model/board.model';
import BoardComment from '@Model/boardComment.model';
import BoardPatchLog from '@Model/boardPatchLog.model';
import User from '@Model/user.model';

const patchComment = async (req: Request, res: Response, next: NextFunction) => {
  const board_pk: number = req.body.board_pk;
  const comment_pk: number = req.body.comment_pk;
  const content: string = req.body.content;
  const user: User = res.locals.user;

  try {
    const board = await Board.findOne({
      where: {
        pk: board_pk,
        user_pk: user.pk,
      },
      include: [
        {
          model: BoardComment,
          where: {
            pk: comment_pk,
          },
          required: false,
        },
      ],
    });
    if (board) {
      if (board.comment[0]) {
        const [now_comment]: [BoardComment, unknown] = await Promise.all([
          BoardComment.update(
            {
              content,
              updatedAt: new Date(),
            },
            {
              where: {
                pk: board.comment.pk,
              },
            }
          ),
          BoardPatchLog.create({
            type: 'comment',
            user_pk: user.pk,
            user_name: user[user.type].name,
            board_pk,
            comment_pk,
            past_content: board.comment.content,
          }),
        ]);

        await res.json({
          success: true,
          data: {
            pk: now_comment.pk,
            user_name: now_comment.user_name,
            content: now_comment.content,
            createdAt: now_comment.createdAt,
          },
        });
      } else {
        next(new CustomError({ name: 'Not_Found_Comment' }));
      }
    } else {
      next(new CustomError({ name: 'Not_Found_Board' }));
    }
  } catch (error) {
    console.log(error);
    next(new CustomError({ name: 'Database_Error' }));
  }
};

export default patchComment;
