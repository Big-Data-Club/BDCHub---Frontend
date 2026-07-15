import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import LMSRoleSelection from '@/app/(learning)/lms/page';
import lmsService from '@/services/lmsService';

// Stub the lmsService.getMyRoles API call to return mock roles
lmsService.getMyRoles = async () => {
  return ['ADMIN', 'TEACHER', 'STUDENT'];
};

const meta: Meta<typeof LMSRoleSelection> = {
  title: 'LMS/Pages/RoleSelection',
  component: LMSRoleSelection,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;

export const MultiRoleSelection: StoryObj = {
  args: {},
  parameters: {
    session: {
      user: { name: "Nguyễn Văn Học Viên", email: "student@bdc.org" },
      expires: "2026-09-09T00:00:00.000Z",
    },
  },
};

export const SingleRoleSelection: StoryObj = {
  args: {},
  parameters: {
    session: {
      user: { name: "Giảng Viên Chính", email: "teacher@bdc.org" },
      expires: "2026-09-09T00:00:00.000Z",
    },
  },
  beforeEach: () => {
    lmsService.getMyRoles = async () => {
      return ['TEACHER'];
    };
  },
};
