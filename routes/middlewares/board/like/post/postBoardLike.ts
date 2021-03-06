import { NextFunction, Request, Response } from 'express';

import CustomError from '@Middleware/error/customError';

import Board from '@Model/board.model';
import BoardComment from '@Model/boardComment.model';
import BoardCommentLike from '@Model/boardCommentLike.model';
import BoardLike from '@Model/boardLike.model';
import User from '@Model/user.model';

const postBoardLike = async (req: Request, res: Response, next: NextFunction) => {
  const user: User = res.locals.user;
  const type: 'board' | 'comment' = req.body.type;
  const board_pk: Board['pk'] = req.body.board_pk;
  const comment_pk: BoardComment['pk'] | undefined = req.body.comment_pk;

  try {
    const board: Board | undefined = await Board.findOne({
      where: {
        pk: board_pk,
      },
      include:
        type === 'comment'
          ? [
              {
                model: BoardComment,
                where: {
                  pk: comment_pk,
                },
                required: false,
                as: 'boardComment',
              },
            ]
          : undefined,
    });

    if (board) {
      if (type === 'board' || (type === 'comment' && board.boardComment[0])) {
        const like: BoardLike | BoardCommentLike | undefined =
          type === 'board'
            ? await BoardLike.findOne({
                where: {
                  board_pk,
                  user_pk: user.pk,
                },
              })
            : await BoardCommentLike.findOne({
                where: {
                  board_pk,
                  comment_pk,
                  user_pk: user.pk,
                },
              });

        if (like) {
          await like.destroy();
        } else {
          if (type === 'board') {
            await BoardLike.create({
              board_pk,
              user_pk: user.pk,
              user_name: user.name,
            });
          } else {
            await BoardCommentLike.create({
              board_pk,
              comment_pk,
              user_pk: user.pk,
              user_name: user.name,
            });
          }
        }
        res.json({
          success: true,
          data: {
            isLiked: !like,
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

export default postBoardLike;
