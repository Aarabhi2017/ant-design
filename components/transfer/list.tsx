import * as React from 'react';
import * as ReactDOM from 'react-dom';
import classNames from 'classnames';
import PureRenderMixin from 'rc-util/lib/PureRenderMixin';
import Checkbox from '../checkbox';
import { TransferItem, TransferDirection } from './index';
import triggerEvent from '../_util/triggerEvent';
import ListBody from './ListBody';

export interface TransferListProps {
  direction: TransferDirection;
  prefixCls: string;
  titleText: string;
  dataSource: TransferItem[];
  filter: string;
  filterOption?: (filterText: any, item: any) => boolean;
  style?: React.CSSProperties;
  checkedKeys: string[];
  handleFilter: (e: any) => void;
  handleSelect: (selectedItem: any, checked: boolean) => void;
  handleSelectAll: (dataSource: any[], checkAll: boolean) => void;
  handleClear: () => void;
  render?: (item: any) => any;
  showSearch?: boolean;
  searchPlaceholder: string;
  notFoundContent: React.ReactNode;
  itemUnit: string;
  itemsUnit: string;
  body?: (props: TransferListProps) => React.ReactNode;
  renderList?: (props: TransferListProps) => React.ReactNode;
  footer?: (props: TransferListProps) => React.ReactNode;
  lazy?: boolean | {};
  onScroll: Function;
  disabled?: boolean;
}

export default class TransferList extends React.Component<TransferListProps, any> {
  static defaultProps = {
    dataSource: [],
    titleText: '',
    showSearch: false,
    lazy: {},
  };

  timer: number;
  triggerScrollTimer: number;
  notFoundNode: HTMLDivElement;

  constructor(props: TransferListProps) {
    super(props);
    this.state = {
      mounted: false,
    };
  }

  componentDidMount() {
    this.timer = window.setTimeout(() => {
      this.setState({
        mounted: true,
      });
    }, 0);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
    clearTimeout(this.triggerScrollTimer);
  }

  shouldComponentUpdate(...args: any[]) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }

  getCheckStatus(filteredDataSource: TransferItem[]) {
    const { checkedKeys } = this.props;
    if (checkedKeys.length === 0) {
      return 'none';
    } else if (filteredDataSource.every(item => checkedKeys.indexOf(item.key) >= 0)) {
      return 'all';
    }
    return 'part';
  }

  handleSelect = (selectedItem: TransferItem) => {
    const { checkedKeys } = this.props;
    const result = checkedKeys.some(key => key === selectedItem.key);
    this.props.handleSelect(selectedItem, !result);
  };

  handleFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.handleFilter(e);
    if (!e.target.value) {
      return;
    }
    // Manually trigger scroll event for lazy search bug
    // https://github.com/ant-design/ant-design/issues/5631
    this.triggerScrollTimer = window.setTimeout(() => {
      const transferNode = ReactDOM.findDOMNode(this) as Element;
      const listNode = transferNode.querySelectorAll('.ant-transfer-list-content')[0];
      if (listNode) {
        triggerEvent(listNode, 'scroll');
      }
    }, 0);
  };

  handleClear = () => {
    this.props.handleClear();
  };

  matchFilter = (text: string, item: TransferItem) => {
    const { filter, filterOption } = this.props;
    if (filterOption) {
      return filterOption(filter, item);
    }
    return text.indexOf(filter) >= 0;
  };

  render() {
    const { mounted } = this.state;
    const {
      prefixCls,
      dataSource,
      titleText,
      checkedKeys,
      disabled,
      body,
      renderList,
      footer,
      style,
      itemUnit,
      itemsUnit,
    } = this.props;

    // ================ Custom Layout ================
    // Footer
    const footerDom = footer && footer(this.props);

    // Body: use `renderList` first and deprecated `body` next
    let bodyDom;
    if (renderList) {
      bodyDom = renderList(this.props);
    } else if (body) {
      bodyDom = body(this.props);
    }

    const listCls = classNames(prefixCls, {
      [`${prefixCls}-with-footer`]: !!footerDom,
    });

    const filteredDataSource: TransferItem[] = [];
    let totalDataSource: TransferItem[] = dataSource;
    const unit = dataSource.length > 1 ? itemsUnit : itemUnit;

    // Render body if not customized
    if (!bodyDom) {
      // totalDataSource = [];

      // const showItems = dataSource.map(item => {
      //   const { renderedText, renderedEl } = this.renderItem(item);
      //   if (filter && filter.trim() && !this.matchFilter(renderedText, item)) {
      //     return null;
      //   }

      //   // all show items
      //   totalDataSource.push(item);
      //   if (!item.disabled) {
      //     // response to checkAll items
      //     filteredDataSource.push(item);
      //   }

      //   const checked = checkedKeys.indexOf(item.key) >= 0;
      //   return (
      //     <Item
      //       disabled={disabled}
      //       key={item.key}
      //       item={item}
      //       lazy={lazy}
      //       renderedText={renderedText}
      //       renderedEl={renderedEl}
      //       checked={checked}
      //       prefixCls={prefixCls}
      //       onClick={this.handleSelect}
      //     />
      //   );
      // });

      // const search = showSearch ? (
      //   <div className={`${prefixCls}-body-search-wrapper`}>
      //     <Search
      //       prefixCls={`${prefixCls}-search`}
      //       onChange={this.handleFilter}
      //       handleClear={this.handleClear}
      //       placeholder={searchPlaceholder}
      //       value={filter}
      //       disabled={disabled}
      //     />
      //   </div>
      // ) : null;

      // const searchNotFound = showItems.every(item => item === null) && (
      //   <div className={`${prefixCls}-body-not-found`}>{notFoundContent}</div>
      // );

      // listBody = (
      //   <div
      //     className={classNames(
      //       showSearch ? `${prefixCls}-body ${prefixCls}-body-with-search` : `${prefixCls}-body`,
      //     )}
      //   >
      //     {search}
      //     {!searchNotFound && (
      //       <Animate
      //         component="ul"
      //         componentProps={{ onScroll }}
      //         className={`${prefixCls}-content`}
      //         transitionName={this.state.mounted ? `${prefixCls}-content-item-highlight` : ''}
      //         transitionLeave={false}
      //       >
      //         {showItems}
      //       </Animate>
      //     )}
      //     {searchNotFound}
      //   </div>
      // );
    }

    const listFooter = footerDom ? <div className={`${prefixCls}-footer`}>{footerDom}</div> : null;

    const checkStatus = this.getCheckStatus(filteredDataSource);
    const checkedAll = checkStatus === 'all';
    const checkAllCheckbox = (
      <Checkbox
        disabled={disabled}
        checked={checkedAll}
        indeterminate={checkStatus === 'part'}
        onChange={() => this.props.handleSelectAll(filteredDataSource, checkedAll)}
      />
    );

    return (
      <div className={listCls} style={style}>
        <div className={`${prefixCls}-header`}>
          {checkAllCheckbox}
          <span className={`${prefixCls}-header-selected`}>
            <span>
              {(checkedKeys.length > 0 ? `${checkedKeys.length}/` : '') + totalDataSource.length}{' '}
              {unit}
            </span>
            <span className={`${prefixCls}-header-title`}>{titleText}</span>
          </span>
        </div>
        {/* {listBody} */}
        <ListBody {...this.props} onItemSelect={this.handleSelect} mounted={mounted} />
        {listFooter}
      </div>
    );
  }
}
