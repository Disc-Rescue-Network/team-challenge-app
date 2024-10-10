import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

type PaginationProps = {
	pageIndex: number; //starts at 0
	totalCount: number;
	perPage: number;
	onPageChange: (pageIndex: number) => Promise<void> | void;
};

export function Pagination({ pageIndex, perPage, totalCount, onPageChange }: PaginationProps) {
	const pages = Math.ceil(totalCount / perPage) || 1;

	if (pages <= 1) return null;

	return (
		<div className='flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0'>
			<span className='text-muted-foreground text-sm'>Total players: {totalCount}</span>

			<div className='flex items-center gap-4 sm:gap-6 lg:gap-8'>
				<div className='text-sm font-medium text-center sm:text-left'>
					Page {pageIndex + 1} of {pages}
				</div>
				<div className='flex items-center gap-2'>
					<Button
						onClick={() => onPageChange(0)}
						variant='outline'
						className='size-8 p-0'
						disabled={pageIndex === 0}
					>
						<ChevronsLeft className='size-4' />
						<span className='sr-only'>First page</span>
					</Button>
					<Button
						onClick={() => onPageChange(pageIndex - 1)}
						variant='outline'
						className='size-8 p-0'
						disabled={pageIndex === 0}
					>
						<ChevronLeft className='size-4' />
						<span className='sr-only'>Previous page</span>
					</Button>
					<Button
						onClick={() => onPageChange(pageIndex + 1)}
						variant='outline'
						className='size-8 p-0'
						disabled={pageIndex === pages - 1}
					>
						<ChevronRight className='size-4' />
						<span className='sr-only'>Next page</span>
					</Button>
					<Button
						onClick={() => onPageChange(pages - 1)}
						variant='outline'
						className='size-8 p-0'
						disabled={pageIndex === pages - 1}
					>
						<ChevronsRight className='size-4' />
						<span className='sr-only'>Last page</span>
					</Button>
				</div>
			</div>
		</div>
	);
}
