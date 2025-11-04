import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CategoryCheckbox from '../../components/CategoryCheckbox';
import ProductSearchBar from '../../components/ProductSearchBar';
import ProductListComponent from '../../components/ProductListComponent';
import axios from 'axios';
import Pagination from '../../components/Pagination';

function StockList() {
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [search, setSearch] = useState({ keyword: "" });
    const [selectedItemId, setSelectedItemId] = useState(1);
    const [pageInfo, setPageInfo] = useState({
        list: [],
        pageNum: 1,
        startPageNum: 1,
        endPageNum: 1,
        totalPageCount: 1
    });
    const [inboundPageInfo, setInboundPageInfo] = useState({
        list: [],
        pageNum: 1,
        totalPageCount: 1
    });
    const [outboundPageInfo, setOutboundPageInfo] = useState({
        list: [],
        pageNum: 1,
        totalPageCount: 1
    });
    //정렬 state
    const [sortConfig, setSortConfig] = useState({ 
        key: 'productId', // 백엔드 @RequestParam 기본값과 일치
        direction: 'DESC' // 백엔드 @RequestParam 기본값과 일치
    });


    const productColumns = [
        { key: 'codeBName', label: '상품 구분' },
        { key: 'name', label: '상품 이름' },
        { key: 'quantity', label: '수량' } // 이 key가 renderCell의 if문과 일치
    ];

    const [params] = useSearchParams();
    const navigate = useNavigate();

    //상품 목록 가져오기
    useEffect(()=>{
        const pageNum = params.get("pageNum") || 1;
        const keyword = params.get("keyword") || "";
        const categoryCodes = params.getAll("categoryCodes") || [];

        // URL 파라미터를 state에 동기화
        setSearch({ keyword });
        setSelectedCategories(categoryCodes);

        const qs = new URLSearchParams();
        qs.set("pageNum", pageNum.toString());
        if (keyword) {
            qs.set("keyword", keyword);
        }
        categoryCodes.forEach(cat => {
            qs.append('categoryCodes', cat);
        });
        qs.set("sortBy", sortConfig.key);
        qs.set("direction", sortConfig.direction);

        axios.get(`/v1/product?${qs.toString()}`)
            .then(res=>{
                setPageInfo(res.data);
            })
            .catch(err=>console.log(err));
    },[params, sortConfig]);

    //입고 내역 가져오기
    useEffect(()=>{
        const page = params.get("inboundPage") || 1;
        const qs = new URLSearchParams();
        qs.set("inboundPage", page.toString());
        if(selectedItemId){
            axios.get(`/v1/stock/${selectedItemId}/inbound?${qs.toString()}`)
            .then(res=>{
                setInboundPageInfo(res.data);
            })
        }
        
    },[params, selectedItemId]);

    //출고 내역 가져오기
    useEffect(()=>{
        const page = params.get("outboundPage") || 1;
        const qs = new URLSearchParams();
        qs.set("outboundPage", page.toString());
        if(selectedItemId){
            axios.get(`/v1/stock/${selectedItemId}/outbound?${qs.toString()}`)
            .then(res=>{
                setOutboundPageInfo(res.data);
            })
        }
    },[params, selectedItemId]);

    const handleSort = (key) => {
        setSortConfig(prevConfig => {
            // 다른 컬럼 클릭 시
            if (prevConfig.key !== key) {
                return { key: key, direction: 'DESC' };
            }
            // 같은 컬럼 클릭 시 (ASC -> DESC -> ASC)
            if (prevConfig.direction === 'DESC') {
                return { key: key, direction: 'ASC' };
            }
            return { key: key, direction: 'DESC' };
        });

        // 정렬 시 1페이지로 이동
        const qs = new URLSearchParams(params);
        qs.set("pageNum", "1");
        navigate({ search: qs.toString() }); // (경로는 현재 페이지에 맞게)
    };

    const handleCategoryChange = (newCategories) => {
        const qs = new URLSearchParams();
        qs.set("pageNum", "1");
        if (search.keyword) {
            qs.set("keyword", search.keyword);
        }
        newCategories.forEach(cat => {
            qs.append('categoryCodes', cat);
        });
        navigate(`/stock?${qs.toString()}`);
    };

    const handleSearchChange = (e) => {
        setSearch({ ...search, [e.target.name]: e.target.value });
    };

    const handleSearchClick = () => {
        const qs = new URLSearchParams();
        qs.set("pageNum", "1");
        if (search.keyword) {
            qs.set("keyword", search.keyword);
        }
        selectedCategories.forEach(cat => {
            qs.append('categoryCodes', cat);
        });
        navigate(`/stock?${qs.toString()}`);
    };

    const handleRowClick = (item) => {
        setSelectedItemId(item.productId);
        const qs = new URLSearchParams(params);
        qs.set("inboundPage", "1");
        qs.set("outboundPage", "1");
        navigate({ search: qs.toString() });
    };

    const pageMove = (num) => {
        const qs = new URLSearchParams(params);
        qs.set("pageNum", num.toString());
        navigate(`/stock?${qs.toString()}`);
    };

    const inboundPageMove = (num) => {
        const qs = new URLSearchParams(params);
        qs.set("inboundPage", num.toString());
        navigate({ search: qs.toString() });
    };

    const outboundPageMove = (num) => {
        const qs = new URLSearchParams(params);
        qs.set("outboundPage", num.toString());
        navigate({ search: qs.toString() });
    };

    return <>
        <CategoryCheckbox
            codeAId={'PRODUCT'}
            checkedList={selectedCategories}
            onChange={handleCategoryChange}
        />
        <ProductSearchBar
            keyword={search.keyword}
            onSearchChange={handleSearchChange}
            onSearchClick={handleSearchClick}
        />
        <ProductListComponent
            pageInfo={pageInfo}
            currentTab={'PRODUCT'}
            onPageChange={pageMove}
            columns={productColumns}
            onRowClick={handleRowClick}
            onSort={handleSort}
            sortConfig={sortConfig}
        />

        <button>입고</button>
        <table className="table table-striped text-center">
            <thead className="table-dark">
                <tr>
                    <th>날짜</th>
                    <th>수량</th>
                </tr>
            </thead>
            <tbody>
            {inboundPageInfo.list.map(item=>
                <tr key={item.createdAt}>
                    <td>{item.createdAt}</td>
                    <td>{item.quantity}</td>
                </tr>
            )}  
            </tbody>
        </table>
        <Pagination
            page={inboundPageInfo.pageNum} 
            totalPage={inboundPageInfo.totalPageCount} 
            onPageChange={inboundPageMove}
        />

        <button>출고</button>
        <table className="table table-striped text-center">
            <thead className="table-dark">
                <tr>
                    <th>날짜</th>
                    <th>수량</th>
                    <th>사유</th>
                </tr>
            </thead>
            <tbody>
            {outboundPageInfo.list.map(item=>
                <tr key={item.createdAt}>
                    <td>{item.createdAt}</td>
                    <td>{item.quantity}</td>
                    <td>{item.notes}</td>
                </tr>
            )}
            </tbody>
        </table>
        <Pagination
            page={outboundPageInfo.pageNum} 
            totalPage={outboundPageInfo.totalPageCount} 
            onPageChange={outboundPageMove}
        />
    </>
}

export default StockList;