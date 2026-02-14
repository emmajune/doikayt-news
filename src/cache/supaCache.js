import { createClient } from "@supabase/supabase-js";

// Create Supabase client
const supabase = createClient(
  "https://gtlobmekbicbhkctqaky.supabase.co",
  "sb_secret_VnysgCOq1-gJXlGHlAmOTg_9-Vkgunx",
);

export async function updateBucket(data) {
  const date = Date.now() + ".txt";

  var uploadData = await supabase.storage
    .from("doikayt_cache")
    .upload(date, data);
  if (uploadData.error) {
    return uploadData.error
  }
  const bucketList = await supabase.storage.from("doikayt_cache").list("", {
    limit: 100,
    offset: 0,
    sortBy: { column: "updated_at", order: "desc" },
  });

  var trashArr = []
  for (let i = 1; i < bucketList.data.length; i++) {
    trashArr.push(bucketList.data[i].name)
  }
  
  await supabase.storage.from('doikayt_cache').remove(trashArr)

  return uploadData.data
}


export async function readBucket() {
  const bucketList = await supabase.storage.from("doikayt_cache").list("", {
    limit: 100,
    offset: 0,
    sortBy: { column: "updated_at", order: "asc" },
  });

  const name = bucketList.data[0].name;
  const url =
    "https://gtlobmekbicbhkctqaky.supabase.co/storage/v1/object/public/doikayt_cache/" +
    name;

  var response = await fetch(url);
  response = await response.json();
  
  return response;
}

export default {updateBucket, readBucket}