import { NextFunction, Request, Response } from 'express';
import * as randomstring from 'randomstring';

import CustomError from '@Middleware/error/customError';

import User from '@Model/user.model';
import deleteUndefined from '@Lib/deleteUndefined';

const postUser = async (req: Request, res: Response, next: NextFunction) => {
  const type: 'student' | 'teacher' | 'parent' | 'graduate' = req.body.type;
  const name: User['name'] = req.body.name;
  const major: User['major'] | undefined = req.body.major;
  const grade: User['grade'] | undefined = (req.body.grade && parseInt(req.body.grade, 10)) || undefined;
  const classNum: User['classNum'] | undefined = (req.body.classNum && parseInt(req.body.classNum, 10)) || undefined;
  const studentNum: User['studentNum'] | undefined = (req.body.studentNum && parseInt(req.body.studentNum, 10)) || undefined;

  const userClause = {
    type,
    name,
    major,
    grade,
    classNum,
    studentNum,
  };

  deleteUndefined(userClause);

  const duplicateUser: User = await User.findOne({
    where: userClause,
  }).catch(err => {
    console.log(err);
    throw new CustomError({ name: 'Database_Error' });
  });

  if (duplicateUser) {
    throw new CustomError({ name: 'Exist_User' });
  }

  const user: User = await User.create(userClause).catch(err => {
    console.log(err);
    throw new CustomError({ name: 'Database_Error' });
  });

  res.json({
    success: true,
    data: {
      user,
    },
  });
};

export default postUser;
