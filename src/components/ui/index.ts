// UI 组件统一导出
// 只导出实际使用的组件，避免导入整个组件库

// 基础组件
export { Button } from './button';
export { Input } from './input';
export { Label } from './label';
export { Separator } from './separator';

// 卡片组件
export { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from './card';

// 表单组件
export { Checkbox } from './checkbox';
export { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
export { Switch } from './switch';

// 反馈组件
export { Badge } from './badge';
export { Skeleton } from './skeleton';
export { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';

// 布局组件
export { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion';
export { ScrollArea } from './scroll-area';
export { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';

// 导航组件
export { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './navigation-menu';
export { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';

// 数据展示组件
export { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
export { PaginationControls } from './pagination';

// 头像组件
export { 
  Avatar,
  AvatarFallback,
  AvatarImage,
} from './avatar';

// 提示组件
export { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'; 