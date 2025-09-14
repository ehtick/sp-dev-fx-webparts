import * as React from 'react';
import styles from './ReactStyledList.module.scss';
import type { IReactStyledListProps } from './IReactStyledListProps';


import type { IBookItem } from '../services/SharePointService';
import { BooksService } from '../services/SharePointService';
import { ListCard } from './ListCard';



interface IReactStyledListState {
  items: IBookItem[];
}

export default class ReactStyledList extends React.Component<IReactStyledListProps, IReactStyledListState> {
  constructor(props: IReactStyledListProps) {
    super(props);
    this.state = { items: [] };

  }
  public async componentDidMount(): Promise<void> {
    const booksService = new BooksService(this.props.spfxContext);
    try {
      const items = await booksService.getBooks();
      this.setState({ items });
    } catch (err) {
      this.setState({ items: [] });
      console.error(err);
    }
  }

  public render(): React.ReactElement<IReactStyledListProps> {
    const { theme, alignment, hasTeamsContext } = this.props;
    const { items } = this.state;

    const containerClass = `${styles.reactStyledList} ${hasTeamsContext ? styles.teams : ''} ${theme === 'light' ? styles.light : styles.dark} ${alignment === 'vertical' ? styles.vertical : styles.horizontal}`;

    return (
      <section className={containerClass}>
        <div className={styles.gridContainer}>
          {items.map((item) => (
            <ListCard key={item.Id ?? item.Number} item={item} />
          ))}
        </div>
      </section>
    );
  }
}


