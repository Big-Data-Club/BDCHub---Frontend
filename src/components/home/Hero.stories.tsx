import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Hero, { HeroProps } from './Hero';

interface StorybookHeroProps extends Omit<HeroProps, 'ease'> {
  easePreset: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const getComputedEase = (preset: string, x1: number, y1: number, x2: number, y2: number): [number, number, number, number] => {
  if (preset.startsWith('Apple Keynote')) {
    return [0.18, 1, 0.32, 1];
  } else if (preset.startsWith('Out Expo')) {
    return [0.16, 1, 0.3, 1];
  } else if (preset.startsWith('Back Out')) {
    return [0.34, 1.56, 0.64, 1];
  } else if (preset.startsWith('Classic Ease-in-out')) {
    return [0.42, 0, 0.58, 1];
  }
  return [x1, y1, x2, y2];
};

const meta: Meta<StorybookHeroProps> = {
  title: 'Landing/Hero/Full Hero',
  component: Hero as any,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    focusSection: {
      control: { type: 'select' },
      options: ['all', 'title', 'description', 'actions', 'stats'],
      description: 'Thành phần được hiển thị tập trung (cô lập hoặc toàn bộ)',
      table: {
        category: '🛠️ Setup & Layout',
      }
    },
    titleText: {
      control: { type: 'text' },
      description: 'Nội dung chữ của tiêu đề',
      table: {
        category: '🔤 Title Motion',
      }
    },
    totalStagger: {
      control: { type: 'range', min: 0.1, max: 2.5, step: 0.05 },
      description: 'Tổng thời gian trễ stagger toàn cục của chuỗi tiêu đề (giây)',
      table: {
        category: '🔤 Title Motion',
      }
    },
    p: {
      control: { type: 'range', min: 1.0, max: 5.0, step: 0.1 },
      description: 'Số mũ phi tuyến bậc p của S-Curve (p=1.0 tuyến tính, p=2.0 S-Curve đối xứng)',
      table: {
        category: '🔤 Title Motion',
      }
    },
    yOffset: {
      control: { type: 'range', min: 0, max: 150, step: 2 },
      description: 'Độ nâng thẳng đứng của chữ cái tiêu đề (pixel)',
      table: {
        category: '🔤 Title Motion',
      }
    },
    duration: {
      control: { type: 'range', min: 0.1, max: 2.0, step: 0.05 },
      description: 'Thời lượng chuyển động của mỗi ký tự tiêu đề (giây)',
      table: {
        category: '🔤 Title Motion',
      }
    },
    easePreset: {
      control: { type: 'select' },
      options: [
        'Apple Keynote [0.18, 1, 0.32, 1]',
        'Out Expo (Smooth) [0.16, 1, 0.3, 1]',
        'Back Out (Snappy Pop) [0.34, 1.56, 0.64, 1]',
        'Classic Ease-in-out [0.42, 0, 0.58, 1]',
        'Custom Cubic Bezier'
      ],
      description: 'Đường cong gia tốc (Easing Curve) được thiết lập sẵn cho mỗi chữ cái',
      table: {
        category: '📈 Title Easing Curve',
      }
    },
    x1: {
      control: { type: 'range', min: 0, max: 1, step: 0.02 },
      description: 'Tọa độ x1 của Custom Cubic Bezier',
      table: {
        category: '📈 Title Easing Curve',
        subcategory: 'Custom Handles',
      }
    },
    y1: {
      control: { type: 'range', min: -0.5, max: 2.0, step: 0.02 },
      description: 'Tọa độ y1 của Custom Cubic Bezier',
      table: {
        category: '📈 Title Easing Curve',
        subcategory: 'Custom Handles',
      }
    },
    x2: {
      control: { type: 'range', min: 0, max: 1, step: 0.02 },
      description: 'Tọa độ x2 của Custom Cubic Bezier',
      table: {
        category: '📈 Title Easing Curve',
        subcategory: 'Custom Handles',
      }
    },
    y2: {
      control: { type: 'range', min: -0.5, max: 2.0, step: 0.02 },
      description: 'Tọa độ y2 của Custom Cubic Bezier',
      table: {
        category: '📈 Title Easing Curve',
        subcategory: 'Custom Handles',
      }
    },
    enableConfirm: {
      control: { type: 'boolean' },
      description: 'Bật/Tắt hiệu ứng confirm (scale zoom nảy nhẹ) sau khi hoàn thành stagger',
      table: {
        category: '✨ Title Zoom & Confirm',
      }
    },
    confirmInitialScale: {
      control: { type: 'range', min: 0.8, max: 1.0, step: 0.01 },
      description: 'Tỷ lệ thu nhỏ ban đầu của tiêu đề (scale lúc bắt đầu)',
      table: {
        category: '✨ Title Zoom & Confirm',
      }
    },
    confirmDelay: {
      control: { type: 'range', min: 0.0, max: 2.5, step: 0.05 },
      description: 'Thời gian trễ trước khi kích hoạt hiệu ứng confirm (giây)',
      table: {
        category: '✨ Title Zoom & Confirm',
      }
    },
    confirmDuration: {
      control: { type: 'range', min: 0.1, max: 1.5, step: 0.05 },
      description: 'Thời lượng chạy của hiệu ứng confirm (giây)',
      table: {
        category: '✨ Title Zoom & Confirm',
      }
    },
    enableTitleFade: {
      control: { type: 'boolean' },
      description: 'Bật/Tắt hiệu ứng mờ tỏ (fade-in) của tiêu đề "Big Data Club".',
      table: {
        category: '🔤 Title Motion',
      }
    },
    titleFadeDuration: {
      control: { type: 'range', min: 0.05, max: 2.0, step: 0.05 },
      description: 'Thời lượng chạy hoạt ảnh mờ tỏ (fade-in) riêng biệt của chữ cái tiêu đề (giây)',
      table: {
        category: '🔤 Title Motion',
      }
    },
    descriptionDuration: {
      control: { type: 'range', min: 0.1, max: 2.0, step: 0.05 },
      description: 'Thời lượng chạy hoạt ảnh mô tả (giây)',
      table: {
        category: '📝 Description Motion',
      }
    },
    descriptionYOffset: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Khoảng cách trượt thẳng đứng từ dưới lên của mô tả (px)',
      table: {
        category: '📝 Description Motion',
      }
    },
    actionsDuration: {
      control: { type: 'range', min: 0.1, max: 2.0, step: 0.05 },
      description: 'Thời lượng chạy hoạt ảnh các nút tương tác (giây)',
      table: {
        category: '⚡ Actions Motion',
      }
    },
    actionsYOffset: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Khoảng cách trượt thẳng đứng từ dưới lên của nút tương tác (px)',
      table: {
        category: '⚡ Actions Motion',
      }
    },
    statsDuration: {
      control: { type: 'range', min: 0.1, max: 2.0, step: 0.05 },
      description: 'Thời lượng chạy hoạt ảnh các thẻ số liệu thống kê (giây)',
      table: {
        category: '📊 Stats Cards Motion',
      }
    },
    statsYOffset: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Khoảng cách trượt thẳng đứng từ dưới lên của các thẻ số liệu (px)',
      table: {
        category: '📊 Stats Cards Motion',
      }
    },
  },
  args: {
    focusSection: 'all',
    titleText: 'Big Data Club',
    totalStagger: 0.55,
    p: 2.0,
    yOffset: 40,
    duration: 0.35,
    easePreset: 'Custom Cubic Bezier',
    x1: 0.1,
    y1: 1.0,
    x2: 0.5,
    y2: 1.4,
    enableConfirm: true,
    confirmInitialScale: 0.85,
    confirmDelay: 1.0,
    confirmDuration: 0.35,
    enableTitleFade: true,
    titleFadeDuration: 0.25,
    descriptionDuration: 0.6,
    descriptionYOffset: 15,
    actionsDuration: 0.6,
    actionsYOffset: 15,
    statsDuration: 0.7,
    statsYOffset: 15,
  },
};

export default meta;
type Story = StoryObj<StorybookHeroProps>;

export const InteractiveHero: Story = {
  name: 'Interactive Hero Animation',
  render: (args) => {
    const computedEase = getComputedEase(args.easePreset, args.x1, args.y1, args.x2, args.y2);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { easePreset, x1, y1, x2, y2, ...heroProps } = args;
    return <Hero {...heroProps} ease={computedEase} />;
  },
  args: {
    focusSection: 'all',
    totalStagger: 0.65,
    p: 2.0,
    yOffset: 110,
    duration: 0.35,
    easePreset: 'Custom Cubic Bezier',
    x1: 0.06,
    y1: 1.0,
    x2: 0.7,
    y2: 1.4,
    enableConfirm: true,
    confirmInitialScale: 0.85,
    confirmDelay: 1.1,
    confirmDuration: 0.3,
    enableTitleFade: false,
  },
};
