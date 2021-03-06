import { NextFunction, Request, Response } from 'express';

import CustomError from '@Middleware/error/customError';

import Notice from '@Model/notice.model';
import NoticeApproveLog from '@Model/noticeApproveLog.model';
import User from '@Model/user.model';

const postNotice = async (req: Request, res: Response, next: NextFunction) => {
  const user: User = res.locals.user;
  const title: Notice['title'] = req.body.title;
  const content: Notice['content'] = req.body.content;

  try {
    const notice: Notice = await Notice.create(
      {
        user_pk: user.pk,
        noticeApproveLog: {
          type: 'C',
          title,
          content,
        },
      },
      {
        include: [
          {
            model: NoticeApproveLog,
            as: 'noticeApproveLog',
          },
        ],
      }
    );

    res.json({
      success: true,
      data: {
        notice,
      },
    });
  } catch (error) {
    console.log(error);
    next(new CustomError({ name: 'Database_Error' }));
  }
};

export default postNotice;
