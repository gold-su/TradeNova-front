import { useCallback, useEffect, useState } from "react";
import { communityApi } from "@/api/communityApi";
import type { CommunityPage, CommunityPostSummary } from "@/types/community";

export function useCommunityPosts(page:number){
  const [data,setData]=useState<CommunityPage<CommunityPostSummary>|null>(null); const [loading,setLoading]=useState(true); const [error,setError]=useState(false);
  const load=useCallback(async()=>{setLoading(true);setError(false);try{setData(await communityApi.listPosts(page));}catch{setError(true);}finally{setLoading(false);}},[page]);
  useEffect(()=>{void load();},[load]); return {data,loading,error,load};
}
