<section class="mini-layout mod_stats">
    <div class="frame_title clearfix">
        <div class="pull-left">
            <span class="help-inline"></span>
            <span class="title">{lang('Stats', 'mod_stats')}</span>
        </div>
        <div class="pull-right">
            <div class="d-i_b">
                <a href="" class="t-d_n m-r_15"><span class="f-s_14">←</span> <span class="t-d_u">{lang('Back', 'admin')}</span></a>
            </div>
        </div>
    </div>
    <div class="row-fluid">
        {include_tpl('../include/left_block')}
        <div class="clearfix span9" id="chartArea">
            {include_tpl('../include/top_form_search')}
            <p id="showNoChartData" style="text-align: center; display: none;">{lang('No chart data for displaying','mod_stats')}</p>
            <button  class="btn btn-small btn-primary" id="saveAsPng">
                <i class="icon-download"></i> </button>
            {if $_GET['charType'] == false || $_GET['charType'] == 'pie'}
                <svg class="mypiechart pieChartStats" data-from="search/getBrandsInSearchData" style="height: 100%;"></svg>
            {/if}
            {if $_GET['charType'] == 'bar'}
                <svg class="mypiechart barChartStats" data-from="search/getBrandsInSearchData" style="height: 600px;"></svg>
            {/if}
        </div>
    </div>
</section>

