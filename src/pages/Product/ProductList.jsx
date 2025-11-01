import React, { useEffect, useState } from 'react';
import CategoryCheckbox from '../../components/CategoryCheckbox';
import axios from 'axios';


function ProdcutList(props) {
    // 부모가 "현재 탭"과 "체크된 항목"을 state로 관리
    const [currentTab, setCurrentTab] = useState('PRODUCT'); // 'PRODUCT' or 'SERVICE'
    const [selectedCategories, setSelectedCategories] = useState([]);

    // 메인 상품 목록 state
    const [products, setProducts] = useState([]);

    // 체크된 항목(selectedCategories)이 바뀔 때마다 메인 API를 다시 호출
    useEffect(() => {
        // MyBatis에 보낼 파라미터 조립
        const params = new URLSearchParams();
        selectedCategories.forEach(cat => params.append('categoryCodes', cat));
        
        // (이름 검색어도 있다면 추가)
        // params.append('keyword', searchKeyword);

        const apiEndpoint = (currentTab === 'PRODUCT') ? '/api/v1/product' : '/api/v1/service';

        // 필터가 적용된 API 호출
        axios.get(`${apiEndpoint}?${params.toString()}`)
        .then(response => {
            setProducts(response.data.list); // 메인 목록 업데이트
        });
        
    }, [selectedCategories, currentTab]); // 탭이나 체크박스가 바뀔 때마다 재실행

    // 탭 변경 시 필터 초기화
    const handleTabChange = (tab) => {
        setCurrentTab(tab);
        setSelectedCategories([]); // 탭을 바꾸면 체크박스 초기화
    };

    return <>
        <button onClick={() => handleTabChange('PRODUCT')}>실물 상품</button>
        <button onClick={() => handleTabChange('SERVICE')}>서비스 상품</button>
        <div className="row">
            <div className="col-3 border p-3 rounded shadow-sm">
                <CategoryCheckbox
                    codeAId={currentTab} // '현재 탭'을 codeAId로 전달
                    checkedList={selectedCategories} // '현재 체크된 목록'을 전달
                    onChange={setSelectedCategories} // "state를 변경하는 함수"를 전달
                />
            </div>
        </div>



    </>
}

export default ProdcutList;