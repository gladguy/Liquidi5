import { Table } from "antd";

const TableComponent = ({
  scroll,
  rowKey,
  locale,
  tableData,
  component,
  pagination,
  expandable,
  tableColumns,
  rowSelection,
  className = "",
  loading = false,
  bordered = false,
  rowClassName = "",
  rootClassName = "",
}) => {
  return (
    <Table
      size="large"
      scroll={scroll}
      rowKey={rowKey}
      locale={locale}
      loading={loading}
      bordered={bordered}
      className={className}
      dataSource={tableData}
      components={component}
      columns={tableColumns}
      expandable={expandable}
      pagination={pagination}
      rowSelection={rowSelection}
      rowClassName={rowClassName}
      rootClassName={rootClassName}
    />
  );
};

export default TableComponent;
