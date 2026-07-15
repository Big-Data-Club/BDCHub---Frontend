import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Badge, BadgeVariant } from '@/components/lms/shared/Badge';
import { ContentTypeBadge } from '@/components/lms/shared/ContentTypeBadge';
import React from 'react';

const meta: Meta = {
  title: 'LMS/Components/Badge',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

export const CustomBadge: StoryObj = {
  render: () => {
    const variants: BadgeVariant[] = ['blue', 'green', 'yellow', 'red', 'gray', 'purple'];
    return (
      <div className="flex flex-wrap gap-4 items-center">
        {variants.map((v) => (
          <Badge key={v} variant={v}>
            {v.toUpperCase()}
          </Badge>
        ))}
      </div>
    );
  },
};

export const ContentBadges: StoryObj = {
  render: () => {
    const types = ['VIDEO', 'DOCUMENT', 'IMAGE', 'TEXT', 'QUIZ', 'FORUM', 'ANNOUNCEMENT', 'CUSTOM_TYPE'];
    return (
      <div className="flex flex-wrap gap-4 items-center">
        {types.map((type) => (
          <ContentTypeBadge key={type} type={type} />
        ))}
      </div>
    );
  },
};
