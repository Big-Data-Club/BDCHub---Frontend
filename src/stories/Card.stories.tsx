import type { Meta, StoryObj } from '@storybook/nextjs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Standard Card</CardTitle>
        <CardDescription>This follows the BDC standard card style.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          BDC cards use rounded-2xl, subtle borders, and layered backgrounds.
        </p>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline">Cancel</Button>
        <Button className="ml-2">Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const AIHighlight: Story = {
  render: () => (
    <Card className="w-[350px] border-blue-500/30 shadow-[0_0_30px_rgba(37,99,235,0.06)] hover:border-blue-500/50 transition-all">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-500/20">
            AI Capability
          </span>
        </div>
        <CardTitle>AI Feature Card</CardTitle>
        <CardDescription>With subtle glow and cyan accents.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This card variant is used for highlighting AI-powered features with a subtle glow effect.
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-blue-600 hover:bg-blue-700">Explore Feature</Button>
      </CardFooter>
    </Card>
  ),
};
