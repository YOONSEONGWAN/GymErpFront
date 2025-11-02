import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

import ProductListComponent from '../../components/ProductListComponent';
import ProductSearchBar from '../../components/ProductSearchBar';
import CategoryCheckbox from '../../components/CategoryCheckbox';

function ProductList() {
    const [currentTab, setCurrentTab] = useState('PRODUCT');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [search, setSearch] = useState({ keyword: "" });
    const [pageInfo, setPageInfo] = useState({
        list: [],
        pageNum: 1,
        startPageNum: 1,
        endPageNum: 1,
        totalPageCount: 1
    });

    const [params] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
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

        const apiEndpoint = (currentTab === 'PRODUCT') ? '/api/v1/product' : '/api/v1/service';

        axios.get(`${apiEndpoint}?${qs.toString()}`)
            .then(response => {
                setPageInfo(response.data);
            })
            .catch(err => console.log(err));

    }, [params, currentTab]);

    const handleTabChange = (tab) => {
        setCurrentTab(tab);
        // URL을 변경하여 useEffect를 트리거
        navigate("/product"); 
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
        navigate(`/product?${qs.toString()}`);
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
        navigate(`/product?${qs.toString()}`);
    };

    const pageMove = (num) => {
        const qs = new URLSearchParams(params);
        qs.set("pageNum", num.toString());
        navigate(`/product?${qs.toString()}`);
    };

    return (
        <>
            <button onClick={() => handleTabChange('PRODUCT')}>실물 상품</button>
            <button onClick={() => handleTabChange('SERVICE')}>서비스 상품</button>

            <div className="row mt-3">
                <div className="col-md-3">
                    <CategoryCheckbox
                        codeAId={currentTab}
                        checkedList={selectedCategories}
                        onChange={handleCategoryChange}
                    />
                </div>
                <div className="col-md-9">
                    <ProductSearchBar
                        keyword={search.keyword}
                        onSearchChange={handleSearchChange}
                        onSearchClick={handleSearchClick}
                    />
                    <button className="btn btn-primary mt-3">상품 등록</button>
                    <ProductListComponent
                        pageInfo={pageInfo}
                        currentTab={currentTab}
                        onPageChange={pageMove}
                    />
                </div>
            </div>
        </>
    );
}

export default ProductList;