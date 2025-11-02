import React from 'react';
import Pagination from './Pagination'; // Pagination 컴포넌트 import 경로 확인 필요

// 부모로부터 pageInfo, currentTab, pageMove 함수를 props로 받음
function ProductListComponent({ pageInfo, currentTab, onPageChange }) {
    return (
        <>
            <table className="table table-striped text-center">
                <thead className="table-dark">
                    <tr>
                        <th>상품 구분</th>
                        <th>상품 이름</th>
                        <th>판매가</th>
                        <th>활성화</th>
                    </tr>
                </thead>
                <tbody>
                    {pageInfo.list && pageInfo.list.map((item, index) => (
                        <tr key={(currentTab === 'PRODUCT' ? item.productId : item.serviceId) || index}>
                            <td>{item.codeBId}</td>
                            <td>{item.name}</td>
                            <td>{item.price}</td>
                            <td>{item.isActive ? '활성' : '비활성'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination 
                page={pageInfo.pageNum} 
                totalPage={pageInfo.totalPageCount} 
                onPageChange={onPageChange}
            />
        </>
    );
}

export default ProductListComponent;